// Creates the Main Hall tables, loads the starting events and people, and creates the owner login.
// Run with: npm run db:setup   (safe to run again; existing rows are left alone)
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const schema = [
  `create table if not exists events (
    id text primary key,
    client text not null,
    name text not null,
    date date not null,
    venue text not null,
    address text not null default '',
    city text not null,
    state text not null,
    guests int not null default 0,
    producer_id text not null default '',
    arrive_time text not null default '',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists event_roles (
    event_id text not null references events(id) on delete cascade,
    id text not null,
    title text not null,
    brief text not null default '',
    position int not null default 0,
    primary key (event_id, id)
  )`,
  `create table if not exists people (
    id text primary key,
    name text not null,
    headline text not null default '',
    city text not null default '',
    email text not null default '',
    phone text not null default '',
    jobget_url text not null default '',
    highlights jsonb not null default '[]',
    notes text not null default '',
    event_id text references events(id) on delete set null,
    role_id text not null default '',
    stage text not null default 'found',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists activity (
    id bigserial primary key,
    person_id text not null references people(id) on delete cascade,
    text text not null,
    at timestamptz not null default now()
  )`,
  `create index if not exists activity_person_idx on activity(person_id, at)`,
  `create table if not exists jobs (
    id text primary key,
    person_id text not null references people(id) on delete cascade,
    event_id text not null references events(id) on delete cascade,
    role_id text not null,
    quote_due date not null,
    quote_status text not null default 'requested',
    quote_amount numeric,
    quote_includes text not null default '',
    quote_notes text not null default '',
    quote_submitted_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists users (
    id text primary key,
    email text not null unique,
    name text not null,
    kind text not null check (kind in ('team', 'partner')),
    password_hash text not null,
    must_change_password boolean not null default true,
    person_id text references people(id) on delete cascade,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists sessions (
    token_hash text primary key,
    user_id text not null references users(id) on delete cascade,
    expires_at timestamptz not null
  )`,
  `create table if not exists emails (
    id text primary key,
    thread_id text not null,
    direction text not null check (direction in ('in', 'out')),
    from_addr text not null,
    from_name text not null default '',
    to_addrs text[] not null default '{}',
    subject text not null default '',
    text_body text not null default '',
    html_body text not null default '',
    person_id text references people(id) on delete set null,
    status text not null default 'sent',
    error text not null default '',
    resend_id text unique,
    read_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists emails_thread_idx on emails(thread_id, created_at)`,
  `create index if not exists emails_person_idx on emails(person_id)`,
];

const events = [
  {
    id: "solstice-energy-fall-leadership-summit-2026",
    client: "Solstice Energy",
    name: "Fall Leadership Summit",
    date: "2026-10-22",
    venue: "Moody Theater",
    address: "310 W Willie Nelson Blvd, Austin, TX 78701",
    city: "Austin",
    state: "TX",
    guests: 650,
    producer: "maya",
    arrive: "7:00 AM",
    roles: [
      ["av", "Sound & screens", "run sound, 3 LED screens, and projectors for 2 side rooms"],
      ["bar", "Bartender", "serve drinks at the evening reception"],
      ["photo", "Event photographer", "photograph the keynotes, panels, and reception"],
    ],
  },
  {
    id: "ridgepath-capital-client-appreciation-dinner-2026",
    client: "Ridgepath Capital",
    name: "Client Appreciation Dinner",
    date: "2026-11-12",
    venue: "The Cyclorama",
    address: "539 Tremont St, Boston, MA 02116",
    city: "Boston",
    state: "MA",
    guests: 400,
    producer: "daniel",
    arrive: "3:00 PM",
    roles: [
      [
        "catering",
        "Catering lead",
        "oversee food service on the night: the catering team, timing, and guests' dietary needs",
      ],
      ["photo", "Event photographer", "photograph arrivals, speeches, and the dinner"],
    ],
  },
];

const people = [
  {
    id: "p-jannie",
    name: "Jannie Davis",
    headline: "Food service director · catering lead",
    city: "Boston, MA",
    email: "janniedavis@gmail.com",
    phone: "+1 351 244 1512",
    highlights: [
      "Runs a kitchen serving 180+ people three meals a day",
      "Has managed catering events of 500+ guests",
      "ServSafe Manager and Allergens certified",
    ],
    notes:
      "Full-time at PAM Health, so pitch as freelance. If she says yes, ask for her ServSafe Manager certificate and a catering reference; some dates on her profile overlap.",
    event: "ridgepath-capital-client-appreciation-dinner-2026",
    role: "catering",
    stage: "found",
    activity: [["2026-09-26", "Added from JobGet"]],
  },
  {
    id: "p-marcus",
    name: "Marcus Bell",
    headline: "Bartender · hotel banquets",
    city: "Austin, TX",
    email: "marcus.bell@example.com",
    phone: "(512) 555-0133",
    highlights: ["5 years bartending hotel banquets", "TABC certified", "Can bring a second bartender"],
    notes: "Sample person: delete when you add real people.",
    event: "solstice-energy-fall-leadership-summit-2026",
    role: "bar",
    stage: "invited",
    activity: [
      ["2026-09-25", "Added from JobGet"],
      ["2026-09-25", "Invitation sent"],
    ],
  },
];

for (const statement of schema) await sql.query(statement);
console.log("Tables ready.");

for (const e of events) {
  await sql`insert into events (id, client, name, date, venue, address, city, state, guests, producer_id, arrive_time)
    values (${e.id}, ${e.client}, ${e.name}, ${e.date}, ${e.venue}, ${e.address}, ${e.city}, ${e.state}, ${e.guests}, ${e.producer}, ${e.arrive})
    on conflict (id) do nothing`;
  for (const [i, [id, title, brief]] of e.roles.entries()) {
    await sql`insert into event_roles (event_id, id, title, brief, position)
      values (${e.id}, ${id}, ${title}, ${brief}, ${i}) on conflict do nothing`;
  }
}
console.log(`Events: ${events.length}`);

for (const p of people) {
  const inserted = await sql`insert into people (id, name, headline, city, email, phone, highlights, notes, event_id, role_id, stage)
    values (${p.id}, ${p.name}, ${p.headline}, ${p.city}, ${p.email}, ${p.phone}, ${JSON.stringify(p.highlights)}::jsonb, ${p.notes}, ${p.event}, ${p.role}, ${p.stage})
    on conflict (id) do nothing returning id`;
  if (inserted.length) {
    for (const [at, text] of p.activity) {
      await sql`insert into activity (person_id, text, at) values (${p.id}, ${text}, ${`${at}T12:00:00Z`})`;
    }
  }
}
console.log(`People: ${people.length}`);

const ownerEmail = (process.env.OWNER_EMAIL || "team@mainhallevents.com").toLowerCase();
const existing = await sql`select id from users where email = ${ownerEmail}`;
if (existing.length === 0) {
  const password = `atr-${randomBytes(6).toString("base64url")}`;
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  await sql`insert into users (id, email, name, kind, password_hash, must_change_password)
    values (${`u-${randomBytes(6).toString("hex")}`}, ${ownerEmail}, ${"Main Hall team"}, 'team',
            ${`s1$${salt.toString("hex")}$${hash.toString("hex")}`}, true)`;
  console.log("\nTeam login created (shown once, you'll be asked to change it):");
  console.log(`  Email:    ${ownerEmail}`);
  console.log(`  Password: ${password}`);
} else {
  console.log(`\nTeam login already exists for ${ownerEmail}.`);
}
