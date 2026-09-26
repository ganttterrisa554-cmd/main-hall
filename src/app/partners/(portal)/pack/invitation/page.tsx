import { DocShell } from "@/components/partners/DocShell";
import { pack } from "@/data/partnerPack";

export const metadata = { title: "Job invitation" };

export default function InvitationPage() {
  const { event, producer } = pack;

  return (
    <DocShell
      slug="invitation"
      facts={[
        { label: "Event", value: event.name },
        { label: "Date", value: "Thu, Oct 22, 2026" },
        { label: "Venue", value: `${event.venue}, Austin` },
        { label: "Guests", value: `About ${event.guests}` },
      ]}
    >
      <p>Hi {pack.preparedFor.split(" ")[0]},</p>
      <p>
        I&apos;m {producer.name.split(" ")[0]}, a producer at Main Hall. We plan company events
        across the US: conferences, product launches, and galas. I came across your profile
        on JobGet, and I think you&apos;d be a great fit for an event we&apos;re running in
        Austin next month.
      </p>

      <h2>The event</h2>
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
            <td>
              {event.date} (setup the day before, {event.setup.split(",")[0]})
            </td>
          </tr>
          <tr>
            <th>Venue</th>
            <td>
              {event.venue}, {event.address}
            </td>
          </tr>
          <tr>
            <th>Guests</th>
            <td>About {event.guests}</td>
          </tr>
        </tbody>
      </table>

      <h2>What we&apos;d need from you</h2>
      <ul>
        <li>Run sound on the main stage for keynotes and panels.</li>
        <li>Set up and run 3 LED screens for slides and live video.</li>
        <li>Projectors and sound for 2 smaller side rooms.</li>
        <li>Bring the equipment, plus a crew if you need one.</li>
      </ul>

      <h2>Why we reached out to you</h2>
      <p>From your JobGet profile:</p>
      <ul>
        {pack.jobgetProfile.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>What happens next</h2>
      <ol>
        <li>
          Reply &ldquo;yes&rdquo; if you&apos;re interested. This isn&apos;t a commitment yet.
        </li>
        <li>Within one business day, we&apos;ll send you a login to our partner portal.</li>
        <li>
          Inside, you&apos;ll find the full event brief, our standard agreement, and a quote
          form.
        </li>
        <li>Send us your quote by Wednesday, September 30.</li>
        <li>If we go ahead, we&apos;ll confirm the booking and your deposit date in writing.</li>
      </ol>

      <p>Happy to talk it through by phone first if that&apos;s easier.</p>

      <div className="signature">
        <div>
          <strong>{producer.name}</strong>
          {producer.title}
          <br />
          {producer.phone} · {producer.email}
        </div>
      </div>
    </DocShell>
  );
}
