import { DocShell, PackEmpty } from "@/components/partners/DocShell";
import { formatLong, formatShort } from "@/data/admin";
import { sendBack, welcomePack } from "@/data/partnerPack";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "Welcome & how it works" };

export default async function WelcomePage() {
  const { person, job, event, role, producer } = await loadPartnerPack();
  if (!person || !job || !event || !role) return <PackEmpty />;

  return (
    <DocShell
      slug="welcome"
      facts={[
        { label: "Your job", value: `${event.client} · ${role.title}` },
        { label: "Quote due", value: formatShort(job.quoteDue) },
        { label: "Your producer", value: producer.name },
        { label: "Phone", value: producer.phone },
      ]}
    >
      <p>Hi {person.name.split(" ")[0]},</p>
      <p>
        Thanks for saying yes. Everything you need for the {event.client} {event.name} is in
        your partner portal. This page explains how working with Main Hall goes, start to finish.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>Read the event brief.</li>
        <li>Send your quote by {formatLong(job.quoteDue)}.</li>
        <li>
          Sign the contractor agreement. You only sign it once; it covers every future job
          with us.
        </li>
        <li>Upload your W-9 and add your payment details.</li>
        <li>
          We confirm the booking by email, usually within 2 business days of getting your
          quote.
        </li>
        <li>We pay your deposit, you do the event, and we pay the rest after.</li>
      </ol>

      <h2>What&apos;s in your pack</h2>
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>What to do</th>
          </tr>
        </thead>
        <tbody>
          {welcomePack.map((doc) => (
            <tr key={doc.slug}>
              <td>{doc.title}</td>
              <td>{doc.action}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>What we need back from you</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {sendBack.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.when}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>How you get paid</h2>
      <ul>
        <li>
          <strong>Deposit:</strong> 50% of your quote, paid 30 days before the event (or when
          we confirm the booking, if the event is sooner).
        </li>
        <li>
          <strong>The rest:</strong> within 14 days of getting your invoice after the event.
        </li>
        <li>All payments go by direct deposit to the account you add in the portal.</li>
        <li>
          You work with us as an independent contractor, so we don&apos;t take tax out of
          your pay. If your payments pass the IRS reporting limit, we&apos;ll send you a
          1099-NEC at tax time.
        </li>
      </ul>

      <h2>Who to call</h2>
      <p>
        {producer.name}, your producer for this event: {producer.phone} · {producer.email}
      </p>
    </DocShell>
  );
}
