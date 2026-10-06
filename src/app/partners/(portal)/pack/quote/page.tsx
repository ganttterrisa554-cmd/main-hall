import Link from "next/link";
import { DocShell, PackEmpty } from "@/components/partners/DocShell";
import { formatLong, formatMoney, formatShort } from "@/data/admin";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "Quote request" };

const statusText = {
  submitted: "Sent — we'll reply within two business days",
  accepted: "Accepted — you're booked",
  declined: "Not going ahead this time",
} as const;

export default async function QuotePage() {
  const { job, event } = await loadPartnerPack();
  if (!job || !event) return <PackEmpty />;

  return (
    <DocShell
      slug="quote"
      facts={[
        { label: "Due", value: formatShort(job.quoteDue) },
        { label: "Price valid for", value: "30 days" },
        { label: "Send it", value: "In your portal" },
        { label: "Our answer", value: "Within 2 business days" },
      ]}
    >
      <p>
        Please send us your price for the work in the event brief. Fill in the quote form in
        your portal — it only takes a minute.
      </p>

      <table>
        <tbody>
          <tr>
            <th>Due</th>
            <td>{formatLong(job.quoteDue)}</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>
              {event.client} · {event.name} · {formatLong(event.date)}
            </td>
          </tr>
          <tr>
            <th>Valid for</th>
            <td>Please keep your price open for at least 30 days</td>
          </tr>
        </tbody>
      </table>

      <h2>Your quote</h2>
      {job.quoteStatus === "requested" ? (
        <>
          <table>
            <tbody>
              <tr>
                <th>Your rate</th>
                <td>Flat for the night, or hourly × expected hours</td>
              </tr>
              <tr>
                <th>Travel</th>
                <td>If any</td>
              </tr>
              <tr>
                <th>Anything else</th>
                <td>Please list</td>
              </tr>
            </tbody>
          </table>
          <p className="print:hidden">
            <Link
              href={`/partners/jobs/${job.id}`}
              className="inline-block bg-copper px-5 py-2.5 text-sm font-medium text-mist transition hover:bg-ink"
            >
              Fill in your quote →
            </Link>
          </p>
        </>
      ) : (
        <p>
          Your quote:{" "}
          <strong>{job.quoteAmount != null ? formatMoney(job.quoteAmount) : "—"}</strong>
          {` · ${statusText[job.quoteStatus]}`}
        </p>
      )}

      <h2>What happens after you send it</h2>
      <ol>
        <li>We review it within 2 business days and may call you with questions.</li>
        <li>If we go ahead, we send a booking confirmation with your agreed price.</li>
        <li>Your deposit is 50% of that price, paid as set out in the welcome letter.</li>
      </ol>
    </DocShell>
  );
}
