import { DocShell, PackEmpty } from "@/components/partners/DocShell";
import { formatLong, formatShort } from "@/data/admin";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "Event brief" };

export default async function BriefPage() {
  const { job, event, role, producer } = await loadPartnerPack();
  if (!job || !event || !role) return <PackEmpty />;

  return (
    <DocShell
      slug="brief"
      facts={[
        { label: "Event day", value: formatShort(event.date) },
        { label: "Arrive by", value: event.arriveTime || "We'll confirm" },
        { label: "Venue", value: `${event.venue}, ${event.city}` },
        { label: "Guests", value: `About ${event.guests}` },
      ]}
    >
      <h2>At a glance</h2>
      <table>
        <tbody>
          <tr>
            <th>Client</th>
            <td>{event.client}</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>{event.name}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{formatLong(event.date)}</td>
          </tr>
          <tr>
            <th>Venue</th>
            <td>
              {event.venue}, {event.address || `${event.city}, ${event.state}`}
            </td>
          </tr>
          <tr>
            <th>Guests</th>
            <td>About {event.guests}</td>
          </tr>
          <tr>
            <th>Your role</th>
            <td>
              {role.title}: {role.brief}
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Your day</h2>
      <p>
        {event.arriveTime
          ? `Arrive by ${event.arriveTime}. `
          : ""}
        {producer.firstName} will send the final run of show a few days before the event.
      </p>

      <h2>Who provides what</h2>
      <table>
        <thead>
          <tr>
            <th>Who</th>
            <th>Provides</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Main Hall</td>
            <td>
              Venue access, a briefing when you arrive, a meal break, and radios or any
              equipment the role needs
            </td>
          </tr>
          <tr>
            <td>You</td>
            <td>
              Yourself on time, dressed per the on-site guide, with your own transport to
              the venue
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Dress</h2>
      <p>All black, closed-toe shoes, no logos.</p>

      <h2>Contact</h2>
      <p>
        {producer.name}, producer: {producer.phone}
      </p>
    </DocShell>
  );
}
