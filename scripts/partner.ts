// Partner workflow from the command line, used when working through Cursor chat.
//   npm run partner -- events                 list events, their roles, and producers
//   npm run partner -- people                 list everyone and where they are
//   npm run partner -- show <personId>        one person, their job, and their quote
//   npm run partner -- add '<json>'           save someone you're reaching out to
//   npm run partner -- check <email>          have we already saved or emailed this address?
//   npm run partner -- emailed                list every address we've ever sent to
//   npm run partner -- agree '<json>'         they said yes: event, job link, quote request, login, email
// See .cursor/rules/partner-flow.mdc for the JSON shapes.
import { formatLong, formatMoney, getRole, stageInfo } from "@/data/admin";
import { company } from "@/data/company";
import { team } from "@/data/team";
import { alreadyEmailedAddresses, emailHistoryFor } from "@/lib/mail";
import { sql } from "@/lib/db";
import { setUpPartner } from "@/lib/partnerFlow";
import {
  addRole,
  createEvent,
  createPerson,
  findPersonByEmail,
  getEvent,
  getJobForPerson,
  getPerson,
  listEvents,
  listPeople,
  logActivity,
  updatePerson,
} from "@/lib/repo";

type PersonInput = {
  name: string;
  headline?: string;
  city?: string;
  email?: string;
  phone?: string;
  jobgetUrl?: string;
  highlights?: string[];
  notes?: string;
};

type EventInput = {
  client: string;
  name: string;
  date: string;
  venue: string;
  address?: string;
  city: string;
  state: string;
  guests?: number;
  producerId: string;
  arriveTime?: string;
};

type RoleInput = { title: string; brief?: string };

type AddInput = PersonInput & { eventId?: string; role?: RoleInput };

type AgreeInput = {
  personId?: string;
  person?: PersonInput;
  email?: string;
  phone?: string;
  eventId?: string;
  event?: EventInput;
  role?: RoleInput;
};

const origin = (process.env.PARTNER_SITE_URL || company.url).replace(/\/$/, "");

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parse<T>(raw: string | undefined): T {
  if (!raw) fail("Pass the details as a JSON string.");
  try {
    return JSON.parse(raw) as T;
  } catch {
    fail("That isn't valid JSON.");
  }
}

async function saveEvent(input: EventInput) {
  for (const key of ["client", "name", "date", "venue", "city", "state", "producerId"] as const) {
    if (!String(input[key] ?? "").trim()) fail(`The event needs "${key}".`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) fail('Event "date" must look like 2026-10-22.');
  if (!team.some((m) => m.id === input.producerId)) {
    fail(`"producerId" must be one of: ${team.map((m) => m.id).join(", ")}.`);
  }
  return createEvent({
    client: input.client.trim(),
    name: input.name.trim(),
    date: input.date,
    venue: input.venue.trim(),
    address: input.address?.trim() ?? "",
    city: input.city.trim(),
    state: input.state.trim().toUpperCase().slice(0, 2),
    guests: Number(input.guests) || 0,
    producerId: input.producerId,
    arriveTime: input.arriveTime?.trim() ?? "",
    roles: [],
  });
}

async function savePerson(input: PersonInput, eventId: string, roleId: string, stage: "found" | "invited") {
  if (!input.name?.trim()) fail('The person needs a "name".');
  const id = await createPerson({
    name: input.name.trim(),
    headline: input.headline?.trim() ?? "",
    city: input.city?.trim() ?? "",
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    jobgetUrl: input.jobgetUrl?.trim() ?? "",
    highlights: (input.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    notes: input.notes?.trim() ?? "",
    eventId,
    roleId,
    stage,
  });
  await logActivity(id, "Added from JobGet");
  if (stage === "invited") await logActivity(id, "Invitation sent");
  return id;
}

async function events() {
  const list = await listEvents();
  console.log(`Producers: ${team.filter((m) => /producer/i.test(m.role)).map((m) => `${m.id} (${m.name})`).join(", ")}\n`);
  if (!list.length) return console.log("No events yet.");
  for (const e of list) {
    console.log(`${e.id}`);
    console.log(`  ${e.client} · ${e.name} · ${formatLong(e.date)} · ${e.venue}, ${e.city}, ${e.state} · ${e.guests} guests · producer ${e.producerId}`);
    for (const r of e.roles) console.log(`  - role ${r.id}: ${r.title}${r.brief ? ` (${r.brief})` : ""}`);
  }
}

async function people() {
  const list = await listPeople();
  if (!list.length) return console.log("No people yet.");
  for (const p of list) {
    console.log(`${p.id}  ${p.name}  [${stageInfo(p.stage).label}]  ${p.email || "no email"}  event=${p.eventId || "-"} role=${p.roleId || "-"}`);
  }
}

async function show(personId: string | undefined) {
  if (!personId) fail("Pass a person id.");
  const person = await getPerson(personId);
  if (!person) fail(`No person with id ${personId}.`);
  const [event, job] = await Promise.all([getEvent(person.eventId), getJobForPerson(person.id)]);
  console.log(`${person.name} (${person.id}) · ${stageInfo(person.stage).label}`);
  console.log(`  ${person.headline} · ${person.city} · ${person.email || "no email"} · ${person.phone || "no phone"}`);
  if (event) console.log(`  Event: ${event.client} · ${event.name} · ${formatLong(event.date)} · role ${getRole(event, person.roleId)?.title ?? person.roleId}`);
  if (job) {
    console.log(`  Job page: ${origin}/partners/jobs/${job.id}`);
    console.log(`  Quote due ${formatLong(job.quoteDue)} · status ${job.quoteStatus}`);
    if (job.quoteAmount != null) console.log(`  Quote: ${formatMoney(job.quoteAmount)} · ${job.quoteIncludes}${job.quoteNotes ? ` · Notes: ${job.quoteNotes}` : ""}`);
  }
  console.log(`  Has login: ${person.hasLogin ? "yes" : "no"}`);
  console.log(`  Dashboard: ${origin}/admin/people/${person.id}`);
}

function printHistory(addr: string, history: { subject: string; status: string; createdAt: string }[]) {
  for (const m of history) {
    console.log(`  ${m.createdAt.slice(0, 10)}  [${m.status}]  ${m.subject}`);
  }
}

async function check(email: string | undefined) {
  if (!email) fail("Pass an email address.");
  const addr = email.trim().toLowerCase();
  const [person, history] = await Promise.all([findPersonByEmail(addr), emailHistoryFor(addr)]);
  if (person) {
    console.log(`Saved: ${person.name} (${person.id}) · ${stageInfo(person.stage).label} · ${person.city || "no city"}`);
    console.log(`  Dashboard: ${origin}/admin/people/${person.id}`);
  } else {
    console.log("Not saved as a person.");
  }
  if (history.length) {
    console.log(`Emailed ${history.length} time${history.length === 1 ? "" : "s"}:`);
    printHistory(addr, history);
  } else {
    console.log("Never emailed.");
  }
}

async function emailed() {
  const rows = await sql`
    select distinct lower(t) as addr, max(created_at) as last_sent
    from emails, unnest(to_addrs) as t
    where direction = 'out' and status <> 'failed'
    group by 1 order by 2 desc`;
  if (!rows.length) return console.log("No outbound emails yet.");
  for (const r of rows) {
    console.log(`${(r.last_sent as Date).toISOString().slice(0, 10)}  ${String(r.addr)}`);
  }
  console.log(`\n${rows.length} addresses emailed.`);
}

async function add(input: AddInput) {
  if (input.email) {
    const addr = input.email.trim().toLowerCase();
    const [existing, history] = await Promise.all([findPersonByEmail(addr), emailHistoryFor(addr)]);
    if (existing) {
      console.log(`Already saved: ${existing.name} (${existing.id}) · ${stageInfo(existing.stage).label}`);
      console.log(`Dashboard: ${origin}/admin/people/${existing.id}`);
      if (history.length) {
        console.log("Prior emails:");
        printHistory(addr, history);
      }
      return;
    }
    if (history.length) {
      console.log(`WARNING: ${addr} was emailed before but isn't saved. Adding anyway. Prior emails:`);
      printHistory(addr, history);
    }
  }
  let roleId = "";
  if (input.eventId) {
    if (!(await getEvent(input.eventId))) fail(`No event with id ${input.eventId}.`);
    if (input.role?.title) roleId = await addRole(input.eventId, input.role.title.trim(), input.role.brief?.trim() ?? "");
  }
  const id = await savePerson(input, input.eventId ?? "", roleId, "found");
  console.log(`Saved ${input.name} as ${id} (stage: Found).`);
  console.log(`Dashboard: ${origin}/admin/people/${id}`);
}

async function agree(input: AgreeInput) {
  const existing = input.personId ? await getPerson(input.personId) : null;
  if (input.personId && !existing) fail(`No person with id ${input.personId}.`);
  if (!existing && !input.person) fail('Pass "personId" for someone already saved, or "person" with their details.');

  let eventId = input.eventId ?? existing?.eventId ?? "";
  let createdEvent = false;
  if (input.event) {
    eventId = await saveEvent(input.event);
    createdEvent = true;
  }
  if (!eventId) fail('Pass "eventId" for an existing event, or "event" with its details.');
  const event = await getEvent(eventId);
  if (!event) fail(`No event with id ${eventId}.`);

  let roleId = input.role?.title ? "" : (existing?.eventId === eventId ? existing.roleId : "");
  if (input.role?.title) roleId = await addRole(eventId, input.role.title.trim(), input.role.brief?.trim() ?? "");
  if (!roleId || !getRole(await getEvent(eventId), roleId)) fail('Pass "role" with a title (and a short brief).');

  let personId: string;
  if (existing) {
    personId = existing.id;
    await updatePerson(personId, { eventId, roleId, email: input.email, phone: input.phone });
  } else {
    personId = await savePerson(
      { ...input.person!, email: input.email ?? input.person!.email, phone: input.phone ?? input.person!.phone },
      eventId,
      roleId,
      "invited",
    );
  }

  const result = await setUpPartner(personId, origin);
  if (result.error) fail(result.error);

  console.log(createdEvent ? `Created event ${eventId}` : `Event ${eventId}`);
  console.log(`Person ${personId}`);
  console.log("");
  console.log(`Job link: ${result.jobUrl}`);
  console.log(`Login: ${result.loginUrl}`);
  console.log(`Email: ${result.email}`);
  console.log(`Temporary password: ${result.tempPassword}`);
  console.log(`Welcome email: ${result.emailStatus === "sent" ? "sent" : `NOT sent. ${result.emailError ?? ""}`.trim()}`);
  console.log(`Dashboard: ${origin}/admin/people/${personId}`);
  console.log("");
  console.log(`Subject: ${result.subject}`);
  console.log("");
  console.log(result.body);
}

const [command, arg] = process.argv.slice(2);
const commands: Record<string, () => Promise<void>> = {
  events,
  people,
  emailed,
  show: () => show(arg),
  check: () => check(arg),
  add: () => add(parse<AddInput>(arg)),
  agree: () => agree(parse<AgreeInput>(arg)),
};

if (!command || !commands[command]) {
  fail(`Use one of: ${Object.keys(commands).join(", ")}.`);
}
commands[command]().catch((error) => fail(error instanceof Error ? error.message : String(error)));
