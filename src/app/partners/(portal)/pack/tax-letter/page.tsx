import { DocShell } from "@/components/partners/DocShell";
import { company } from "@/data/company";
import { formatMoney } from "@/data/partner";
import { pack } from "@/data/partnerPack";

export const metadata = { title: "Year-end tax letter" };

const paid: [string, string, number][] = [
  ["Sep 5", "Vesper Analytics · Analytics Summit · final payment", 41200],
  ["Oct 1", "Quill & Circuit · Product Launch Night · deposit", 12500],
  ["Oct 5", "Summitline Software · Customer Summit · deposit", 24000],
  ["Oct 8", "Solstice Energy · Fall Leadership Summit · deposit", 19650],
  ["Oct 27", "Quill & Circuit · Product Launch Night · balance", 12500],
  ["Nov 2", "Summitline Software · Customer Summit · balance + extra room equipment", 27850],
  ["Nov 5", "Solstice Energy · Fall Leadership Summit · balance", 19650],
  ["Nov 10", "Beaconfield Foods · Holiday Gala · deposit", 18250],
  ["Dec 22", "Beaconfield Foods · Holiday Gala · balance", 18250],
];

export default function TaxLetterPage() {
  const total = paid.reduce((sum, [, , amount]) => sum + amount, 0);

  return (
    <DocShell
      slug="tax-letter"
      facts={[
        { label: "Tax year", value: "2026" },
        { label: "Total paid", value: formatMoney(total) },
        { label: "Form", value: "1099-NEC (attached)" },
        { label: "Corrections by", value: "Jan 31, 2027" },
      ]}
    >
      <p className="bg-amber-500/15 px-4 py-3 text-sm text-amber-900 print:hidden">
        The 1099-NEC itself is the official IRS form, produced by your accountant or payroll
        software. This letter goes with it.
      </p>

      <p>Hi {pack.preparedFor.split(" ")[0]},</p>
      <p>
        Your 2026 Form 1099-NEC from Main Hall is attached. It shows the total we paid you in
        2026 for your work as an independent contractor. We&apos;ve sent the same information
        to the IRS.
      </p>

      <h2>What we paid you in 2026</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>For</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {paid.map(([date, label, amount]) => (
            <tr key={`${date}-${label}`}>
              <td>{date}</td>
              <td>{label}</td>
              <td>{formatMoney(amount)}</td>
            </tr>
          ))}
          <tr className="total">
            <td colSpan={2}>Total for 2026</td>
            <td>{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Good to know</h2>
      <ul>
        <li>We didn&apos;t take any tax out of these payments.</li>
        <li>The total on your 1099-NEC (box 1) matches the total above.</li>
        <li>
          Payments count in the year you received them, so anything we pay in January 2027
          will be on next year&apos;s form.
        </li>
        <li>We&apos;re not tax advisers. Please talk to your accountant about what you owe.</li>
      </ul>

      <h2>Something wrong?</h2>
      <p>
        If a payment is missing, or your name, address, or tax ID has changed, tell us by
        January 31, 2027 and we&apos;ll send a corrected form. If your details changed, please
        also update your W-9 in the portal.
      </p>

      <h2>Thank you</h2>
      <p>Thanks for a great 2026. We look forward to working with you again this year.</p>

      <div className="signature">
        <div>
          <strong>Accounts team, Main Hall Events</strong>
          accounts@mainhallevents.com · {company.phone}
        </div>
      </div>
    </DocShell>
  );
}
