import { Fragment } from "react";
import { DocShell } from "@/components/partners/DocShell";
import { pack } from "@/data/partnerPack";

export const metadata = { title: "Quote request" };

const sections: { heading: string; rows: [string, string][] }[] = [
  {
    heading: "Equipment",
    rows: [
      ["Main-stage sound system (mixing desk, speakers)", "1 set"],
      ["Wireless mics: 4 handheld, 6 clip-on", "10"],
      ["Center LED screen (about 20 × 11 ft)", "1"],
      ["Side LED screens", "2"],
      ["Camera(s) for side screens", "___"],
      ["Speaker preview screen", "1"],
      ["Side-room kits (projector, screen, 2 mics, speakers)", "2"],
      ["Laptops for slides (main + backup)", "2"],
    ],
  },
  {
    heading: "Crew",
    rows: [
      ["Sound engineer (setup day + event day)", "___ hrs"],
      ["Screens / video tech", "___ hrs"],
      ["Side-room tech", "___ hrs"],
      ["Setup and pack-up crew", "___ people × ___ hrs"],
    ],
  },
  {
    heading: "Other",
    rows: [
      ["Transport and delivery", "___"],
      ["Anything else (please list)", "___"],
    ],
  },
];

export default function QuotePage() {
  return (
    <DocShell
      slug="quote"
      facts={[
        { label: "Due", value: "Wed, Sep 30 · 5 PM CT" },
        { label: "Price valid for", value: "30 days" },
        { label: "Send it", value: "In your portal" },
        { label: "Our answer", value: "Within 2 business days" },
      ]}
    >
      <p>
        Please send us your price for the work in the event brief. You can fill in the form
        in your portal, or use your own format as long as it covers everything below.
      </p>

      <table>
        <tbody>
          <tr>
            <th>Due</th>
            <td>{pack.quoteDue}</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>
              {pack.event.client} · {pack.event.name} · {pack.event.date}
            </td>
          </tr>
          <tr>
            <th>Valid for</th>
            <td>Please keep your price open for at least 30 days</td>
          </tr>
        </tbody>
      </table>

      <h2>Quote form</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <Fragment key={section.heading}>
              <tr>
                <td colSpan={3}>
                  <strong>{section.heading}</strong>
                </td>
              </tr>
              {section.rows.map(([item, qty]) => (
                <tr key={item}>
                  <td>{item}</td>
                  <td className="blank">{qty}</td>
                  <td className="blank">$ ________</td>
                </tr>
              ))}
            </Fragment>
          ))}
          <tr>
            <td colSpan={2}>
              <strong>Subtotal</strong>
            </td>
            <td className="blank">$ ________</td>
          </tr>
          <tr>
            <td colSpan={2}>Sales tax (if you charge it)</td>
            <td className="blank">$ ________</td>
          </tr>
          <tr className="total">
            <td colSpan={2}>Total</td>
            <td className="blank">$ ________</td>
          </tr>
        </tbody>
      </table>

      <h2>Please also tell us</h2>
      <ul>
        <li>Anything in the brief you can&apos;t cover, or would suggest doing differently.</li>
        <li>What you need from the venue or from us (power, parking, loading time).</li>
        <li>How many people you&apos;ll bring. Names can come later.</li>
      </ul>

      <h2>What happens after you send it</h2>
      <ol>
        <li>We review it within 2 business days and may call you with questions.</li>
        <li>If we go ahead, we send a booking confirmation with your agreed price.</li>
        <li>Your deposit is 50% of that price, paid as set out in the welcome letter.</li>
      </ol>
    </DocShell>
  );
}
