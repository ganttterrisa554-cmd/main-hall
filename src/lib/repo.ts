import type { Activity, Job, Prospect, Role, Stage, StaffEvent } from "@/data/admin";
import { newId, slugify, sql } from "@/lib/db";

type Row = Record<string, unknown>;

const toIso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? ""));

function mapEvent(row: Row, roles: Role[]): StaffEvent {
  return {
    id: String(row.id),
    client: String(row.client),
    name: String(row.name),
    date: String(row.date),
    venue: String(row.venue),
    address: String(row.address),
    city: String(row.city),
    state: String(row.state),
    guests: Number(row.guests),
    producerId: String(row.producer_id),
    arriveTime: String(row.arrive_time),
    roles,
  };
}

export async function listEvents(): Promise<StaffEvent[]> {
  const [events, roles] = await Promise.all([
    sql`select id, client, name, date::text as date, venue, address, city, state, guests, producer_id, arrive_time
        from events order by date`,
    sql`select event_id, id, title, brief from event_roles order by position, title`,
  ]);
  return events.map((e) =>
    mapEvent(
      e,
      roles
        .filter((r) => r.event_id === e.id)
        .map((r) => ({ id: r.id, title: r.title, brief: r.brief })),
    ),
  );
}

export async function getEvent(id: string): Promise<StaffEvent | null> {
  const [rows, roles] = await Promise.all([
    sql`select id, client, name, date::text as date, venue, address, city, state, guests, producer_id, arrive_time
        from events where id = ${id}`,
    sql`select id, title, brief from event_roles where event_id = ${id} order by position, title`,
  ]);
  if (!rows[0]) return null;
  return mapEvent(
    rows[0],
    roles.map((r) => ({ id: r.id, title: r.title, brief: r.brief })),
  );
}

export async function createEvent(input: Omit<StaffEvent, "id">) {
  let id = slugify(`${input.client} ${input.name} ${input.date.slice(0, 4)}`) || newId("ev-");
  const taken = await sql`select 1 from events where id = ${id}`;
  if (taken.length) id = `${id}-${newId("", 4)}`;
  await sql`insert into events (id, client, name, date, venue, address, city, state, guests, producer_id, arrive_time)
    values (${id}, ${input.client}, ${input.name}, ${input.date}, ${input.venue}, ${input.address}, ${input.city},
            ${input.state}, ${input.guests}, ${input.producerId}, ${input.arriveTime})`;
  for (const [i, role] of input.roles.entries()) {
    await sql`insert into event_roles (event_id, id, title, brief, position)
      values (${id}, ${role.id}, ${role.title}, ${role.brief}, ${i}) on conflict do nothing`;
  }
  return id;
}

export async function addRole(eventId: string, title: string, brief: string) {
  const existing = await sql`select id from event_roles where event_id = ${eventId} and lower(title) = lower(${title})`;
  if (existing[0]) return String(existing[0].id);
  let id = slugify(title) || newId("role-", 4);
  const taken = await sql`select 1 from event_roles where event_id = ${eventId} and id = ${id}`;
  if (taken.length) id = `${id}-${newId("", 4)}`;
  await sql`insert into event_roles (event_id, id, title, brief, position)
    values (${eventId}, ${id}, ${title}, ${brief},
            (select coalesce(max(position) + 1, 0) from event_roles where event_id = ${eventId}))`;
  return id;
}

const personColumns = sql`
  p.id, p.name, p.headline, p.city, p.email, p.phone, p.jobget_url, p.highlights, p.notes,
  coalesce(p.event_id, '') as event_id, p.role_id, p.stage,
  coalesce(e.producer_id, '') as producer_id,
  exists (select 1 from users u where u.person_id = p.id) as has_login`;

function mapPerson(row: Row, activity: Activity[]): Prospect {
  return {
    id: String(row.id),
    name: String(row.name),
    headline: String(row.headline),
    city: String(row.city),
    email: String(row.email),
    phone: String(row.phone),
    jobgetUrl: String(row.jobget_url),
    highlights: (row.highlights as string[]) ?? [],
    notes: String(row.notes),
    eventId: String(row.event_id),
    roleId: String(row.role_id),
    stage: row.stage as Stage,
    producerId: String(row.producer_id),
    hasLogin: Boolean(row.has_login),
    activity,
  };
}

export async function listPeople(): Promise<Prospect[]> {
  const rows = await sql`select ${personColumns}
    from people p left join events e on e.id = p.event_id order by p.created_at desc`;
  return rows.map((r) => mapPerson(r, []));
}

export async function findPersonByEmail(email: string): Promise<Prospect | null> {
  const addr = email.trim().toLowerCase();
  if (!addr) return null;
  const rows = await sql`select ${personColumns}
    from people p left join events e on e.id = p.event_id where lower(p.email) = ${addr} limit 1`;
  if (!rows[0]) return null;
  const activity = await sql`select text, at from activity where person_id = ${rows[0].id} order by at, id`;
  return mapPerson(rows[0], activity.map((a) => ({ at: toIso(a.at), text: String(a.text) })));
}

export async function getPerson(id: string): Promise<Prospect | null> {
  const [rows, activity] = await Promise.all([
    sql`select ${personColumns} from people p left join events e on e.id = p.event_id where p.id = ${id}`,
    sql`select text, at from activity where person_id = ${id} order by at, id`,
  ]);
  if (!rows[0]) return null;
  return mapPerson(
    rows[0],
    activity.map((a) => ({ at: toIso(a.at), text: String(a.text) })),
  );
}

export async function createPerson(input: {
  name: string;
  headline: string;
  city: string;
  email: string;
  phone: string;
  jobgetUrl: string;
  highlights: string[];
  notes: string;
  eventId: string;
  roleId: string;
  stage: Stage;
}) {
  const id = newId("p-");
  await sql`insert into people (id, name, headline, city, email, phone, jobget_url, highlights, notes, event_id, role_id, stage)
    values (${id}, ${input.name}, ${input.headline}, ${input.city}, ${input.email.trim().toLowerCase()}, ${input.phone},
            ${input.jobgetUrl}, ${JSON.stringify(input.highlights)}::jsonb, ${input.notes}, ${input.eventId || null},
            ${input.roleId}, ${input.stage})`;
  return id;
}

export async function updatePerson(
  personId: string,
  fields: { eventId?: string; roleId?: string; email?: string; phone?: string },
) {
  await sql`update people set
    event_id = coalesce(nullif(${fields.eventId ?? ""}, ''), event_id),
    role_id = coalesce(nullif(${fields.roleId ?? ""}, ''), role_id),
    email = coalesce(nullif(${fields.email?.trim().toLowerCase() ?? ""}, ''), email),
    phone = coalesce(nullif(${fields.phone ?? ""}, ''), phone)
    where id = ${personId}`;
}

export async function logActivity(personId: string, text: string) {
  await sql`insert into activity (person_id, text) values (${personId}, ${text})`;
}

export async function setStage(personId: string, stage: Stage, note?: string) {
  await sql`update people set stage = ${stage} where id = ${personId}`;
  if (note) await logActivity(personId, note);
}

function mapJob(row: Row): Job {
  return {
    id: String(row.id),
    personId: String(row.person_id),
    eventId: String(row.event_id),
    roleId: String(row.role_id),
    quoteDue: String(row.quote_due),
    quoteStatus: row.quote_status as Job["quoteStatus"],
    quoteAmount: row.quote_amount == null ? null : Number(row.quote_amount),
    quoteIncludes: String(row.quote_includes),
    quoteNotes: String(row.quote_notes),
    quoteSubmittedAt: row.quote_submitted_at ? toIso(row.quote_submitted_at) : null,
  };
}

const jobColumns = sql`id, person_id, event_id, role_id, quote_due::text as quote_due, quote_status,
  quote_amount, quote_includes, quote_notes, quote_submitted_at`;

export async function getJob(id: string) {
  const rows = await sql`select ${jobColumns} from jobs where id = ${id}`;
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function getJobForPerson(personId: string) {
  const rows = await sql`select ${jobColumns} from jobs where person_id = ${personId} order by created_at desc limit 1`;
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function listJobsForPerson(personId: string) {
  const rows = await sql`select ${jobColumns} from jobs where person_id = ${personId} order by created_at desc`;
  return rows.map(mapJob);
}

export async function createJob(person: Prospect, event: StaffEvent, roleTitle: string, quoteDue: string) {
  const id = `${slugify(`${event.client} ${roleTitle}`)}-${newId("", 4)}`;
  await sql`insert into jobs (id, person_id, event_id, role_id, quote_due)
    values (${id}, ${person.id}, ${event.id}, ${person.roleId}, ${quoteDue})`;
  return id;
}

export async function submitQuote(jobId: string, amount: number, includes: string, notes: string) {
  await sql`update jobs set quote_status = 'submitted', quote_amount = ${amount}, quote_includes = ${includes},
    quote_notes = ${notes}, quote_submitted_at = now() where id = ${jobId}`;
}

export async function setQuoteStatus(jobId: string, status: Job["quoteStatus"]) {
  await sql`update jobs set quote_status = ${status} where id = ${jobId}`;
}

export async function findUserByEmail(email: string) {
  const rows = await sql`select id, email, name, kind, password_hash, must_change_password, person_id
    from users where email = ${email.trim().toLowerCase()}`;
  return rows[0] ?? null;
}

export async function upsertPartnerUser(person: Prospect, passwordHash: string) {
  const email = person.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    if (existing.kind !== "partner") throw new Error("That email belongs to a team login.");
    await sql`update users set password_hash = ${passwordHash}, must_change_password = true, person_id = ${person.id},
      name = ${person.name} where id = ${existing.id}`;
    await sql`delete from sessions where user_id = ${existing.id}`;
    return String(existing.id);
  }
  const id = newId("u-");
  await sql`insert into users (id, email, name, kind, password_hash, must_change_password, person_id)
    values (${id}, ${email}, ${person.name}, 'partner', ${passwordHash}, true, ${person.id})`;
  return id;
}

export async function updatePassword(userId: string, passwordHash: string) {
  await sql`update users set password_hash = ${passwordHash}, must_change_password = false where id = ${userId}`;
}

export async function getSignature(personId: string, doc: string) {
  const rows = await sql`select signed_name, signed_at from partner_signatures
    where person_id = ${personId} and doc = ${doc}`;
  const row = rows[0];
  return row ? { signedName: String(row.signed_name), signedAt: toIso(row.signed_at) } : null;
}

export async function saveSignature(personId: string, doc: string, signedName: string) {
  await sql`insert into partner_signatures (person_id, doc, signed_name)
    values (${personId}, ${doc}, ${signedName})
    on conflict (person_id, doc) do update set signed_name = ${signedName}, signed_at = now()`;
}

export async function getPartnerDetails(personId: string) {
  const rows = await sql`select w9_filename, w9_uploaded_at, pay_account_name, pay_bank,
      pay_last4, pay_updated_at
    from partner_details where person_id = ${personId}`;
  const row = rows[0];
  if (!row) return null;
  return {
    w9Filename: String(row.w9_filename),
    w9UploadedAt: row.w9_uploaded_at ? toIso(row.w9_uploaded_at) : null,
    payAccountName: String(row.pay_account_name),
    payBank: String(row.pay_bank),
    payLast4: String(row.pay_last4),
    payUpdatedAt: row.pay_updated_at ? toIso(row.pay_updated_at) : null,
  };
}

export async function saveW9(personId: string, filename: string, mime: string, data: Buffer) {
  await sql`insert into partner_details (person_id, w9_filename, w9_mime, w9_data, w9_uploaded_at, updated_at)
    values (${personId}, ${filename}, ${mime}, ${data}, now(), now())
    on conflict (person_id) do update set
      w9_filename = ${filename}, w9_mime = ${mime}, w9_data = ${data},
      w9_uploaded_at = now(), updated_at = now()`;
}

export async function savePayment(
  personId: string,
  details: { accountName: string; bank: string; routingEnc: string; accountEnc: string; last4: string },
) {
  await sql`insert into partner_details (person_id, pay_account_name, pay_bank, pay_routing_enc,
      pay_account_enc, pay_last4, pay_updated_at, updated_at)
    values (${personId}, ${details.accountName}, ${details.bank}, ${details.routingEnc},
      ${details.accountEnc}, ${details.last4}, now(), now())
    on conflict (person_id) do update set
      pay_account_name = ${details.accountName}, pay_bank = ${details.bank},
      pay_routing_enc = ${details.routingEnc}, pay_account_enc = ${details.accountEnc},
      pay_last4 = ${details.last4}, pay_updated_at = now(), updated_at = now()`;
}

export async function getW9File(personId: string) {
  const rows = await sql`select w9_filename, w9_mime, w9_data from partner_details
    where person_id = ${personId} and w9_data is not null`;
  const row = rows[0];
  if (!row || !row.w9_data) return null;
  return {
    filename: String(row.w9_filename),
    mime: String(row.w9_mime),
    data: Buffer.from(row.w9_data as Uint8Array),
  };
}

export type ChatMessage = {
  id: string;
  direction: "in" | "out";
  body: string;
  authorName: string;
  readAt: string | null;
  createdAt: string;
};

export async function listChatMessages(personId: string): Promise<ChatMessage[]> {
  const rows = await sql`select id, direction, body, author_name, read_at, created_at
    from chat_messages where person_id = ${personId} order by created_at, id`;
  return rows.map((r) => ({
    id: String(r.id),
    direction: r.direction as "in" | "out",
    body: String(r.body),
    authorName: String(r.author_name),
    readAt: r.read_at ? toIso(r.read_at) : null,
    createdAt: toIso(r.created_at),
  }));
}

export async function addChatMessage(personId: string, direction: "in" | "out", body: string, authorName: string) {
  const id = newId("c-");
  await sql`insert into chat_messages (id, person_id, direction, body, author_name)
    values (${id}, ${personId}, ${direction}, ${body}, ${authorName})`;
  return id;
}

export async function markChatRead(personId: string, direction: "in" | "out") {
  await sql`update chat_messages set read_at = now()
    where person_id = ${personId} and direction = ${direction} and read_at is null`;
}

export async function unreadChatForAdmin(personId: string) {
  const rows = await sql`select count(*) as n from chat_messages
    where person_id = ${personId} and direction = 'in' and read_at is null`;
  return Number(rows[0]?.n ?? 0);
}

export async function unreadChatCounts(): Promise<Record<string, number>> {
  const rows = await sql`select person_id, count(*) as n from chat_messages
    where direction = 'in' and read_at is null group by person_id`;
  return Object.fromEntries(rows.map((r) => [String(r.person_id), Number(r.n)]));
}
