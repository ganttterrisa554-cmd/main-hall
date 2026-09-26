import { DocShell } from "@/components/partners/DocShell";
import { SignBox } from "@/components/partners/SignBox";
import { pack } from "@/data/partnerPack";

export const metadata = { title: "Booking confirmation" };

const price: [string, string][] = [
  ["Equipment (sound, 3 LED screens, side-room kits, laptops)", "$24,600"],
  ["Crew (setup day, event day, pack-up)", "$12,800"],
  ["Transport and delivery", "$1,900"],
];

const times: [string, string][] = [
  ["Wed, Oct 21 · 1:00 PM", "Load-in and setup"],
  ["Wed, Oct 21 · 6:00 PM", "Sound check"],
  ["Thu, Oct 22 · 6:30 AM", "Crew call"],
  ["Thu, Oct 22 · 8:00 AM", "Doors open"],
  ["Thu, Oct 22 · 7:00 PM", "Event ends, pack-up starts"],
  ["Thu, Oct 22 · 11:00 PM", "Everything out of the venue"],
];

export default function BookingPage() {
  const { event, producer } = pack;

  return (
    <DocShell
      slug="booking"
      facts={[
        { label: "Agreed price", value: "$39,300" },
        { label: "Deposit (50%)", value: "$19,650 by Oct 8" },
        { label: "Balance", value: "$19,650 after event" },
        { label: "Event day", value: "Thu, Oct 22, 2026" },
      ]}
    >
      <p>Hi {pack.preparedFor.split(" ")[0]},</p>
      <p>
        Thanks for your quote. We&apos;re happy to confirm the booking below. Together with
        your contractor agreement, this confirmation is your contract for this job.
      </p>

      <h2>The job</h2>
      <table>
        <tbody>
          <tr>
            <th>Booking reference</th>
            <td>ATR-BK-0147</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>
              {event.client} · {event.name}
            </td>
          </tr>
          <tr>
            <th>Date</th>
            <td>
              {event.date}, with setup on {event.setup}
            </td>
          </tr>
          <tr>
            <th>Venue</th>
            <td>
              {event.venue}, {event.address}
            </td>
          </tr>
          <tr>
            <th>Your role</th>
            <td>Sound, screens, and projection, as set out in the event brief (ATR-BRF-0147)</td>
          </tr>
        </tbody>
      </table>

      <h2>Agreed price</h2>
      <p>Based on your quote dated September 29, 2026.</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {price.map(([item, amount]) => (
            <tr key={item}>
              <td>{item}</td>
              <td>{amount}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Total</td>
            <td>$39,300</td>
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
            <td>$19,650</td>
            <td>By Thursday, October 8, 2026</td>
          </tr>
          <tr>
            <td>Balance</td>
            <td>$19,650</td>
            <td>Within 14 days of your invoice after the event</td>
          </tr>
        </tbody>
      </table>
      <p>Both payments go by direct deposit to the account in your portal.</p>

      <h2>Final times</h2>
      <table>
        <tbody>
          {times.map(([time, what]) => (
            <tr key={time}>
              <th>{time}</th>
              <td>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Still needed from you</h2>
      <ul>
        <li>Crew names, for venue badges, by Thursday, October 15.</li>
        <li>
          Your insurance certificate naming Main Hall Events and {event.client} as additional
          insured, by Thursday, October 15.
        </li>
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
          {producer.title} · {producer.phone}
        </div>
      </div>

      <div className="mt-10 print:hidden">
        <SignBox
          expectedName={pack.preparedFor}
          date="Oct 1, 2026"
          prompt="Type your full name to accept this booking."
          button="Accept booking"
          done="Accepted"
        />
      </div>
    </DocShell>
  );
}
