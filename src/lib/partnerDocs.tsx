import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatLong, formatShort, type Prospect, type Role, type StaffEvent } from "@/data/admin";
import { company } from "@/data/company";

type DocProducer = { name: string; phone: string; email: string; role?: string };

const ink = "#12141a";
const muted = "#6b6e78";
const mist = "#f4f1eb";
const copper = "#c45c26";
const stone = "#e8e4dc";

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 11,
    lineHeight: 1.5,
    color: ink,
    fontFamily: "Helvetica",
  },
  logo: { fontSize: 15, letterSpacing: 3, fontFamily: "Helvetica-Bold" },
  tagline: { marginTop: 4, fontSize: 8, letterSpacing: 1.6, color: muted },
  rule: { height: 3, backgroundColor: copper, marginTop: 14 },
  kicker: { marginTop: 22, fontSize: 8, letterSpacing: 2, color: copper },
  title: { marginTop: 6, fontSize: 24, fontFamily: "Helvetica-Bold" },
  prepared: { marginTop: 4, fontSize: 10, color: muted },
  facts: {
    flexDirection: "row",
    marginTop: 18,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: stone,
  },
  fact: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 9,
    backgroundColor: mist,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: stone,
  },
  factLabel: { fontSize: 7, letterSpacing: 1.2, color: muted },
  factValue: { marginTop: 3, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  h2: { marginTop: 18, marginBottom: 6, fontSize: 13, fontFamily: "Helvetica-Bold" },
  p: { fontSize: 11, lineHeight: 1.5 },
  li: { fontSize: 11, lineHeight: 1.5, marginBottom: 2 },
  table: { borderTopWidth: 1, borderColor: stone },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: stone,
  },
  rowLabel: { width: 96, fontSize: 10, fontFamily: "Helvetica-Bold" },
  rowValue: { flex: 1, fontSize: 10.5, lineHeight: 1.45 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: stone,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: muted,
  },
});

function Header({ kicker, title, preparedFor }: { kicker: string; title: string; preparedFor: string }) {
  return (
    <View>
      <Text style={styles.logo}>MAIN HALL</Text>
      <Text style={styles.tagline}>CORPORATE EVENT PLANNING</Text>
      <View style={styles.rule} />
      <Text style={styles.kicker}>{kicker.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.prepared}>Prepared for {preparedFor}</Text>
    </View>
  );
}

function Facts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <View style={styles.facts}>
      {facts.map((fact) => (
        <View key={fact.label} style={styles.fact}>
          <Text style={styles.factLabel}>{fact.label.toUpperCase()}</Text>
          <Text style={styles.factValue}>{fact.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Li({ children }: { children: string }) {
  return <Text style={styles.li}>{"\u2022"}  {children}</Text>;
}

function Footer({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>
        {company.name} · {company.email} · {company.phone} · {company.site}
      </Text>
      <Text>{label}</Text>
    </View>
  );
}

function contactLine(producer: DocProducer) {
  return producer.role
    ? `${producer.name}, ${producer.role.toLowerCase()}: ${producer.phone}`
    : `${producer.name}: ${producer.phone}`;
}

function EventBriefDoc({
  person,
  event,
  role,
  producer,
}: {
  person: Prospect;
  event: StaffEvent;
  role: Role | undefined;
  producer: DocProducer;
}) {
  const firstName = producer.role ? producer.name.split(" ")[0] : "Your producer";
  return (
    <Document title={`Event brief — ${event.client}`} author={company.name}>
      <Page size="LETTER" style={styles.page}>
        <Header kicker="Your documents" title="Event brief" preparedFor={person.name} />
        <Facts
          facts={[
            { label: "Event day", value: formatShort(event.date) },
            { label: "Arrive by", value: event.arriveTime || "We'll confirm" },
            { label: "Venue", value: `${event.venue}, ${event.city}` },
            { label: "Guests", value: `About ${event.guests}` },
          ]}
        />

        <Text style={styles.h2}>At a glance</Text>
        <View style={styles.table}>
          <Row label="Client" value={event.client} />
          <Row label="Event" value={event.name} />
          <Row label="Date" value={formatLong(event.date)} />
          <Row
            label="Venue"
            value={`${event.venue}, ${event.address || `${event.city}, ${event.state}`}`}
          />
          <Row label="Guests" value={`About ${event.guests}`} />
          {role ? <Row label="Your role" value={`${role.title}: ${role.brief}`} /> : null}
        </View>

        <Text style={styles.h2}>Your day</Text>
        <Text style={styles.p}>
          {event.arriveTime ? `Arrive by ${event.arriveTime}. ` : ""}
          {firstName} will send the final run of show a few days before the event.
        </Text>

        <Text style={styles.h2}>Who provides what</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Who</Text>
            <Text style={[styles.rowValue, { fontFamily: "Helvetica-Bold" }]}>Provides</Text>
          </View>
          <Row
            label="Main Hall"
            value="Venue access, a briefing when you arrive, a meal break, and radios or any equipment the role needs"
          />
          <Row
            label="You"
            value="Yourself on time, dressed per the on-site guide, with your own transport to the venue"
          />
        </View>

        <Text style={styles.h2}>Dress</Text>
        <Text style={styles.p}>All black, closed-toe shoes, no logos.</Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>{contactLine(producer)}</Text>

        <Footer label={`Event brief · ${formatShort(event.date)}`} />
      </Page>
    </Document>
  );
}

function OnSiteGuideDoc({ person, producer }: { person: Prospect; producer: DocProducer }) {
  return (
    <Document title="On-site guide" author={company.name}>
      <Page size="LETTER" style={styles.page}>
        <Header kicker="Your documents" title="On-site guide" preparedFor={person.name} />
        <Facts
          facts={[
            { label: "Dress", value: "All black" },
            { label: "Arrive", value: "At your call time" },
            { label: "Crew names", value: "7 days before" },
            { label: "On-site contact", value: producer.name },
          ]}
        />

        <Text style={[styles.p, { marginTop: 14 }]}>
          How we work at every Main Hall event. It&apos;s short, and it keeps things smooth for
          you, the venue, and our clients.
        </Text>

        <Text style={styles.h2}>Before the day</Text>
        <Li>Send your crew names at least 7 days before, so the venue can make badges.</Li>
        <Li>Check your loading time and parking details in the portal.</Li>
        <Li>Test and charge everything the night before.</Li>

        <Text style={styles.h2}>Arriving</Text>
        <Li>Arrive at your call time. Don&apos;t arrive before your loading slot.</Li>
        <Li>When you arrive, find the producer.</Li>
        <Li>Keep your badge visible all day.</Li>

        <Text style={styles.h2}>Dress</Text>
        <Text style={styles.p}>All black, closed-toe shoes, no logos or slogans.</Text>

        <Text style={styles.h2}>During the event</Text>
        <Li>Phones on silent in any room with guests.</Li>
        <Li>Stay out of guest areas unless you&apos;re working there.</Li>
        <Li>Crew meals are provided. Please don&apos;t take guest food or drinks.</Li>
        <Li>No alcohol while working, including at receptions.</Li>
        <Li>If guests or press ask you questions, point them to a Main Hall team member.</Li>

        <Text style={styles.h2}>Photos and social media</Text>
        <Text style={styles.p}>
          No photos, videos, or posts from the event without written OK from Main Hall.
        </Text>

        <Text style={styles.h2}>Safety</Text>
        <Li>Follow venue rules and instructions from venue staff.</Li>
        <Li>Tape down cables and never block exits or walkways.</Li>
        <Li>Report any injury or damage to the producer straight away.</Li>
        <Li>If something feels unsafe, stop and call the producer.</Li>

        <Text style={styles.h2}>If something goes wrong</Text>
        <Text style={styles.p}>
          Call the producer first: {producer.name}, {producer.phone}. Running late? Call as soon
          as you know.
        </Text>

        <Text style={styles.h2}>Leaving</Text>
        <Li>Pack up on schedule and leave your area clean.</Li>
        <Li>Check out with the producer before you leave.</Li>

        <Footer label="On-site guide" />
      </Page>
    </Document>
  );
}

export async function buildPartnerDocPdfs(input: {
  person: Prospect;
  event: StaffEvent;
  role: Role | undefined;
  producer: DocProducer;
  quoteDue: string;
}): Promise<{ filename: string; content: Buffer }[]> {
  const { person, event, role, producer } = input;
  const [brief, guide] = await Promise.all([
    renderToBuffer(<EventBriefDoc person={person} event={event} role={role} producer={producer} />),
    renderToBuffer(<OnSiteGuideDoc person={person} producer={producer} />),
  ]);
  return [
    {
      filename: `Main Hall - Event Brief - ${event.client} ${formatShort(event.date)}.pdf`,
      content: brief,
    },
    { filename: "Main Hall - On-site Guide.pdf", content: guide },
  ];
}
