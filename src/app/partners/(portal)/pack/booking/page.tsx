import { redirect } from "next/navigation";
import { DocShell } from "@/components/partners/DocShell";
import { SignBox } from "@/components/partners/SignBox";
import { formatLong, formatMoney, formatShort } from "@/data/admin";
import { docDate, docRef, findDoc } from "@/data/partnerPack";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "Booking confirmation" };

export default async function BookingPage() {
  const { person, job, event, role, producer } = await loadPartnerPack();
  if (!job || job.quoteStatus !== "accepted" || !event || !role || !person) {
    redirect("/partners/pack");
  }

  const total = job.quoteAmount ?? 0;
  const deposit = total / 2;
  const briefDoc = findDoc("brief")!;
  const bookingDoc = findDoc("booking")!;

  return (
    <DocShell
      slug="booking"
      facts={[
        { label: "Agreed price", value: formatMoney(total) },
        { label: "Deposit (50%)", value: formatMoney(deposit) },
        { label: "Balance", value: `${formatMoney(total - deposit)} after event` },
        { label: "Event day", value: formatShort(event.date) },
      ]}
    >
      <p>Hi {person.name.split(" ")[0]},</p>
      <p>
        Thanks for your quote. We&apos;re happy to confirm the booking below. Together with
        your contractor agreement, this confirmation is your contract for this job.
      </p>

      <h2>The job</h2>
      <table>
        <tbody>
          <tr>
            <th>Booking reference</th>
            <td>{docRef(bookingDoc, job)}</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>
              {event.client} · {event.name}
            </td>
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
            <th>Your role</th>
            <td>
              {role.title}, as set out in the event brief ({docRef(briefDoc, job)})
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Agreed price</h2>
      <p>Based on the quote you sent us.</p>
      <table>
        <tbody>
          <tr className="total">
            <td>Total</td>
            <td>{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>

      <h2>When you get paid</h2>
      <table>
        <thead>
          <tr>
            <th>Payment</th>
            <th>Amount</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Deposit (50%)</td>
            <td>{formatMoney(deposit)}</td>
            <td>30 days before the event, or when we confirm the booking</td>
          </tr>
          <tr>
            <td>Balance</td>
            <td>{formatMoney(total - deposit)}</td>
            <td>Within 14 days of your invoice after the event</td>
          </tr>
        </tbody>
      </table>
      <p>Both payments go by direct deposit to the account in your portal.</p>

      <h2>Still needed from you</h2>
      <ul>
        <li>Your signed contractor agreement, W-9, and payment details if we don&apos;t have them yet.</li>
        <li>Tell us straight away if anything in your quote changes.</li>
      </ul>

      <h2>If plans change</h2>
      <p>
        Cancellations follow section 5 of your contractor agreement. In short: if we cancel 8
        to 30 days before, you keep the deposit; 7 days or less before, we pay the full price.
        If you need to cancel, give us at least 14 days&apos; notice.
      </p>

      <div className="signature">
        <div>
          <strong>{producer.name}</strong>
          {producer.role} · {producer.phone}
        </div>
      </div>

      <div className="mt-10 print:hidden">
        <SignBox
          expectedName={person.name}
          date={docDate()}
          prompt="Type your full name to accept this booking."
          button="Accept booking"
          done="Accepted"
        />
      </div>
    </DocShell>
  );
}
