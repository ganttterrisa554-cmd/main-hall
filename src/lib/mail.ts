import { Resend } from "resend";
import { team } from "@/data/team";
import { newId, sql } from "@/lib/db";

const DEFAULT_FROM = "Main Hall Events <onboarding@resend.dev>";

export function mailSettings() {
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  const address = from.match(/<([^>]+)>/)?.[1] ?? from;
  const domain = address.split("@")[1] ?? "";
  return {
    configured: Boolean(process.env.RESEND_API_KEY?.trim()),
    from,
    address,
    domain,
    testMode: domain === "resend.dev",
  };
}

function client() {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

/** A named sender mails from their own address on our domain (daniel@…), which reads as a person rather than a shared inbox. */
function senderAddress(fromName: string | undefined, settings: ReturnType<typeof mailSettings>) {
  if (!fromName || settings.testMode) return null;
  const member = team.find((m) => m.name.toLowerCase() === fromName.trim().toLowerCase());
  return member && member.email.endsWith(`@${settings.domain}`) ? member.email : null;
}

function threadReplyTo(threadId: string) {
  const { address, testMode } = mailSettings();
  if (testMode) return undefined;
  const [local, domain] = address.split("@");
  return `${local}+${threadId}@${domain}`;
}

export type SendResult = { id: string; threadId: string; status: "sent" | "failed" | "not_sent"; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  personId?: string | null;
  threadId?: string;
  fromName?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<SendResult> {
  const settings = mailSettings();
  const id = newId("m-", 10);
  const threadId = input.threadId ?? newId("t-", 8);
  const to = input.to.trim().toLowerCase();
  const fromAddr = senderAddress(input.fromName, settings) ?? settings.address;
  const from = input.fromName && !settings.testMode ? `${input.fromName} <${fromAddr}>` : settings.from;

  let status: SendResult["status"] = "not_sent";
  let error = "";
  let resendId: string | null = null;

  const resend = client();
  if (!resend) {
    error = "Email isn't connected yet (no Resend API key). Copy the message and send it yourself.";
  } else {
    const { data, error: sendError } = await resend.emails.send({
      from,
      to: [to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: threadReplyTo(threadId),
      attachments: input.attachments,
    });
    if (sendError) {
      status = "failed";
      error = sendError.message;
    } else {
      status = "sent";
      resendId = data?.id ?? null;
    }
  }

  await sql`insert into emails (id, thread_id, direction, from_addr, from_name, to_addrs, subject, text_body, html_body, person_id, status, error, resend_id, read_at)
    values (${id}, ${threadId}, 'out', ${fromAddr}, ${input.fromName ?? "Main Hall"}, ${[to]}, ${input.subject},
            ${input.text}, ${input.html ?? ""}, ${input.personId ?? null}, ${status}, ${error}, ${resendId}, now())`;

  return { id, threadId, status, error };
}

const normalizeSubject = (s: string) =>
  s.replace(/^\s*((re|fw|fwd|aw)\s*:\s*)+/i, "").trim().toLowerCase();

async function matchThread(toAddrs: string[], fromAddr: string, subject: string) {
  for (const addr of toAddrs) {
    const token = addr.match(/\+(t-[a-z0-9]+)@/i)?.[1];
    if (token) {
      const hit = await sql`select 1 from emails where thread_id = ${token} limit 1`;
      if (hit.length) return token;
    }
  }
  const candidates = await sql`
    select thread_id, subject from emails
    where from_addr = ${fromAddr} or ${fromAddr} = any(to_addrs)
    order by created_at desc limit 50`;
  const wanted = normalizeSubject(subject);
  const match = candidates.find((c) => normalizeSubject(String(c.subject)) === wanted);
  return match ? String(match.thread_id) : newId("t-", 8);
}

function parseFrom(raw: string) {
  const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return match ? { name: match[1].trim(), address: match[2].trim().toLowerCase() } : { name: "", address: raw.trim().toLowerCase() };
}

export async function storeInboundEmail(resendEmailId: string) {
  const exists = await sql`select id from emails where resend_id = ${resendEmailId}`;
  if (exists.length) return { stored: false };

  const resend = client();
  if (!resend) throw new Error("Resend API key missing");
  const { data: email, error } = await resend.emails.receiving.get(resendEmailId);
  if (error || !email) throw new Error(error?.message ?? "Could not load email");

  const from = parseFrom(email.headers?.from ?? email.from);
  const toAddrs = (email.to ?? []).map((a) => a.toLowerCase());
  const threadId = await matchThread(toAddrs, from.address, email.subject ?? "");
  const person = await sql`select id from people where lower(email) = ${from.address} limit 1`;
  const personId = person[0]?.id ?? null;

  await sql`insert into emails (id, thread_id, direction, from_addr, from_name, to_addrs, subject, text_body, html_body, person_id, status, resend_id, created_at)
    values (${newId("m-", 10)}, ${threadId}, 'in', ${from.address}, ${from.name}, ${toAddrs}, ${email.subject ?? ""},
            ${email.text ?? ""}, ${email.html ?? ""}, ${personId}, 'received', ${resendEmailId}, ${email.created_at ?? new Date().toISOString()})
    on conflict (resend_id) do nothing`;
  if (personId) {
    await sql`insert into activity (person_id, text) values (${personId}, ${`Email received: ${email.subject || "(no subject)"}`})`;
  }
  return { stored: true };
}

export async function pullInboundEmails() {
  const resend = client();
  if (!resend) return { checked: 0, added: 0, error: "Email isn't connected yet (no Resend API key)." };
  const { data, error } = await resend.emails.receiving.list({ limit: 50 });
  if (error || !data) return { checked: 0, added: 0, error: error?.message ?? "Could not reach Resend" };
  let added = 0;
  for (const item of data.data) {
    const result = await storeInboundEmail(item.id);
    if (result.stored) added++;
  }
  return { checked: data.data.length, added, error: "" };
}

export type ThreadSummary = {
  threadId: string;
  subject: string;
  lastAt: string;
  lastFrom: string;
  lastDirection: "in" | "out";
  preview: string;
  count: number;
  unread: number;
  personId: string | null;
  personName: string | null;
  counterpart: string;
  hasOut: boolean;
};

export async function listThreads(filter: "all" | "unread" | "sent" = "all"): Promise<ThreadSummary[]> {
  const rows = await sql`
    with t as (
      select thread_id,
             count(*) as count,
             count(*) filter (where direction = 'in' and read_at is null) as unread,
             bool_or(direction = 'out') as has_out,
             max(created_at) as last_at,
             max(person_id) as person_id
      from emails group by thread_id
    ),
    last as (
      select distinct on (thread_id) thread_id, subject, direction, from_addr, from_name, to_addrs, text_body
      from emails order by thread_id, created_at desc
    ),
    first as (
      select distinct on (thread_id) thread_id, subject
      from emails order by thread_id, created_at asc
    )
    select t.*, last.direction, last.from_addr, last.from_name, last.to_addrs, last.text_body, first.subject as subject,
           p.name as person_name
    from t join last using (thread_id) join first using (thread_id)
    left join people p on p.id = t.person_id
    order by t.last_at desc
    limit 200`;

  return rows
    .map((r) => {
      const direction = r.direction as "in" | "out";
      const counterpart =
        direction === "in" ? String(r.from_name || r.from_addr) : String((r.to_addrs as string[])?.[0] ?? "");
      return {
        threadId: String(r.thread_id),
        subject: String(r.subject || "(no subject)"),
        lastAt: (r.last_at as Date).toISOString(),
        lastFrom: String(r.from_name || r.from_addr),
        lastDirection: direction,
        preview: String(r.text_body ?? "").replace(/\s+/g, " ").slice(0, 140),
        count: Number(r.count),
        unread: Number(r.unread),
        personId: (r.person_id as string) ?? null,
        personName: (r.person_name as string) ?? null,
        counterpart,
        hasOut: Boolean(r.has_out),
      };
    })
    .filter((t) => (filter === "unread" ? t.unread > 0 : filter === "sent" ? t.hasOut : true));
}

export type EmailMessage = {
  id: string;
  threadId: string;
  direction: "in" | "out";
  fromAddr: string;
  fromName: string;
  toAddrs: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
  status: string;
  error: string;
  createdAt: string;
  personId: string | null;
};

function mapMessage(r: Record<string, unknown>): EmailMessage {
  return {
    id: String(r.id),
    threadId: String(r.thread_id),
    direction: r.direction as "in" | "out",
    fromAddr: String(r.from_addr),
    fromName: String(r.from_name),
    toAddrs: (r.to_addrs as string[]) ?? [],
    subject: String(r.subject),
    textBody: String(r.text_body),
    htmlBody: String(r.html_body),
    status: String(r.status),
    error: String(r.error),
    createdAt: (r.created_at as Date).toISOString(),
    personId: (r.person_id as string) ?? null,
  };
}

export async function getThread(threadId: string) {
  const rows = await sql`select * from emails where thread_id = ${threadId} order by created_at`;
  return rows.map(mapMessage);
}

export async function markThreadRead(threadId: string) {
  await sql`update emails set read_at = now() where thread_id = ${threadId} and read_at is null`;
}

export async function listEmailsForPerson(personId: string) {
  const rows = await sql`select * from emails where person_id = ${personId} order by created_at desc limit 50`;
  return rows.map(mapMessage);
}

export type SentRecord = { subject: string; status: string; threadId: string; createdAt: string };

// Every outbound email ever sent to an address, newest first.
export async function emailHistoryFor(address: string): Promise<SentRecord[]> {
  const to = address.trim().toLowerCase();
  if (!to) return [];
  const rows = await sql`
    select subject, status, thread_id, created_at
    from emails
    where direction = 'out'
      and exists (select 1 from unnest(to_addrs) as t where lower(t) = ${to})
    order by created_at desc`;
  return rows.map((r) => ({
    subject: String(r.subject),
    status: String(r.status),
    threadId: String(r.thread_id),
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

// Addresses we've already sent to, lowercased — for bulk dedupe before a batch.
export async function alreadyEmailedAddresses(addresses: string[]): Promise<Set<string>> {
  const list = addresses.map((a) => a.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return new Set();
  const rows = await sql`
    select distinct lower(t) as addr
    from emails, unnest(to_addrs) as t
    where direction = 'out' and status <> 'failed' and lower(t) = any(${list})`;
  return new Set(rows.map((r) => String(r.addr)));
}

export async function unreadCount() {
  const rows = await sql`select count(*) as n from emails where direction = 'in' and read_at is null`;
  return Number(rows[0]?.n ?? 0);
}
