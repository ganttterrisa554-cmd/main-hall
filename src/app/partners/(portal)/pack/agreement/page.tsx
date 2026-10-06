import { DocShell, PackEmpty } from "@/components/partners/DocShell";
import { SignBox } from "@/components/partners/SignBox";
import { formatDateTime } from "@/data/admin";
import { docDate } from "@/data/partnerPack";
import { loadPartnerPack } from "@/lib/partnerPack";
import { getSignature } from "@/lib/repo";

export const metadata = { title: "Contractor agreement" };

export default async function AgreementPage() {
  const { person } = await loadPartnerPack();
  if (!person) return <PackEmpty />;
  const signature = await getSignature(person.id, "agreement");

  return (
    <DocShell
      slug="agreement"
      facts={[
        { label: "Between", value: `Main Hall & ${person.name}` },
        { label: "Starts", value: "When you sign" },
        { label: "Covers", value: "Every future job" },
        { label: "Sign", value: "Once, online" },
      ]}
    >
      <p className="bg-amber-500/15 px-4 py-3 text-sm text-amber-900 print:hidden">
        Draft template. Have a lawyer review this before sending it to real partners.
      </p>

      <h2>1. Who this is between</h2>
      <p>
        This agreement is between Main Hall Events (&ldquo;Main Hall&rdquo;, &ldquo;we&rdquo;) and{" "}
        {person.name} (&ldquo;you&rdquo;). It starts on the
        date you sign it.
      </p>

      <h2>2. How jobs work</h2>
      <ul>
        <li>This one agreement covers every job you do with us.</li>
        <li>Each job starts with an event brief from us and a quote from you.</li>
        <li>
          A job is only confirmed when we send you a written booking confirmation accepting
          your quote (a &ldquo;Booking&rdquo;).
        </li>
        <li>You&apos;re free to turn down any job.</li>
      </ul>

      <h2>3. You&apos;re an independent contractor</h2>
      <ul>
        <li>You run your own business. You are not a Main Hall employee.</li>
        <li>
          You decide how to do the work and bring your own equipment, unless a Booking says
          otherwise. You&apos;re free to work for others.
        </li>
        <li>
          You handle your own taxes, insurance, and your crew&apos;s pay. You don&apos;t get
          employee benefits from Main Hall.
        </li>
        <li>You can&apos;t sign contracts or make promises on Main Hall&apos;s behalf.</li>
      </ul>

      <h2>4. Pay</h2>
      <ul>
        <li>We pay the price in the Booking.</li>
        <li>
          Deposit: 50%, paid 30 days before the event, or within 5 business days of the
          Booking if the event is sooner.
        </li>
        <li>The rest: within 14 days of getting your invoice after the event.</li>
        <li>We only pay extra costs if we&apos;ve approved them in writing beforehand.</li>
      </ul>

      <h2>5. Cancellations</h2>
      <h3>If we cancel</h3>
      <ul>
        <li>More than 30 days before the event: we pay any costs we approved that you&apos;ve already spent.</li>
        <li>8 to 30 days before: you keep the deposit.</li>
        <li>7 days or less before: we pay the full price.</li>
      </ul>
      <h3>If you cancel</h3>
      <ul>
        <li>Tell us as soon as you can, and at least 14 days before the event.</li>
        <li>Return any deposit we&apos;ve paid.</li>
        <li>Help us find a replacement where you reasonably can.</li>
      </ul>
      <p>
        If an event can&apos;t go ahead for reasons outside anyone&apos;s control (like severe
        weather or a government order), we&apos;ll agree fair payment for work already done.
      </p>

      <h2>6. Doing the work</h2>
      <ul>
        <li>Arrive on time and follow the event brief, the on-site guide, and venue rules.</li>
        <li>Keep your equipment safe, in working order, and up to local electrical and safety codes.</li>
        <li>Hold any licenses the law requires for your work.</li>
      </ul>

      <h2>7. Insurance</h2>
      <p>If you bring your own equipment or crew, you must have:</p>
      <ul>
        <li>General liability insurance of at least $1,000,000 per incident.</li>
        <li>Workers&apos; compensation insurance if the law requires it for your crew.</li>
      </ul>
      <p>
        Send us your insurance certificate before your first Booking, name Main Hall (and the
        client, if we ask) as additional insured, and tell us right away if your cover lapses.
      </p>

      <h2>8. Confidentiality</h2>
      <ul>
        <li>
          Keep client names, event details, guest lists, and anything else you learn through
          us private, during and after this agreement.
        </li>
        <li>No photos, videos, or social media posts from events without our written OK.</li>
        <li>Delete or return event files when we ask.</li>
      </ul>

      <h2>9. Our clients</h2>
      <p>
        For 12 months after an event, you won&apos;t approach the Main Hall client from that
        event directly to offer event work, unless we agree in writing.
      </p>

      <h2>10. Responsibility</h2>
      <ul>
        <li>You&apos;re responsible for your equipment and your crew.</li>
        <li>
          You&apos;ll cover claims and costs caused by your (or your crew&apos;s) carelessness
          or by breaking this agreement. We&apos;ll do the same for ours.
        </li>
        <li>Neither of us is responsible for the other&apos;s indirect losses, like lost profits.</li>
      </ul>

      <h2>11. Ending this agreement</h2>
      <p>
        Either of us can end this agreement by email. Bookings already confirmed still go
        ahead unless cancelled under section 5.
      </p>

      <h2>12. General</h2>
      <ul>
        <li>This agreement is governed by the laws of the State of [__________].</li>
        <li>This agreement plus each Booking is our whole deal. Changes must be in writing.</li>
        <li>Electronic signatures count as real signatures.</li>
      </ul>

      <h2>Signatures</h2>
      <div className="signature">
        <div>
          <strong>For Main Hall Events</strong>
          Name and title · Date
        </div>
        <div>
          <strong>{person.name}</strong>
          Date
        </div>
      </div>

      <div className="mt-8 print:hidden">
        <SignBox
          expectedName={person.name}
          date={docDate()}
          signed={
            signature ? { name: signature.signedName, date: formatDateTime(signature.signedAt) } : null
          }
        />
      </div>
    </DocShell>
  );
}
