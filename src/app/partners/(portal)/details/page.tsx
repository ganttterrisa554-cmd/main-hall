import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentForm, W9Form } from "@/components/partners/DetailsForms";
import { formatDateTime } from "@/data/admin";
import { requirePartner } from "@/lib/auth";
import { getPartnerDetails } from "@/lib/repo";
import { secretsConfigured } from "@/lib/secrets";

export const metadata = { title: "Your details" };

export default async function DetailsPage() {
  const user = await requirePartner();
  if (user.mustChangePassword) redirect("/partners/password?next=/partners/details");

  const details = user.personId ? await getPartnerDetails(user.personId) : null;
  const hasW9 = Boolean(details?.w9Filename);
  const hasPayment = Boolean(details?.payLast4);

  return (
    <div>
      <Link href="/partners" className="text-sm text-muted transition hover:text-copper">
        ← Your jobs
      </Link>
      <h1 className="font-display mt-6 text-3xl text-ink sm:text-4xl">Your details</h1>

      <section className="mt-10 border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">Tax form (W-9)</h2>
        {hasW9 ? (
          <div className="mt-3">
            <p className="text-ink">
              {details?.w9Filename}
              <span className="ml-2 text-sm text-muted">
                Uploaded {details?.w9UploadedAt ? formatDateTime(details.w9UploadedAt) : ""}
              </span>
            </p>
            <W9Form label="Replace" />
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Download the official{" "}
              <a
                href="https://www.irs.gov/forms-pubs/about-form-w-9"
                target="_blank"
                rel="noreferrer"
                className="text-copper"
              >
                IRS W-9 form ↗
              </a>
              , fill it in, and upload it here. We need it once, before we can pay you.
            </p>
            <W9Form label="Upload" />
          </>
        )}
      </section>

      <section className="mt-8 border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">Payment details</h2>
        {hasPayment ? (
          <div className="mt-3">
            <p className="text-ink">
              {details?.payAccountName} · {details?.payBank} · account ending {details?.payLast4}
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-copper">Update</summary>
              <PaymentForm label="Save" />
            </details>
          </div>
        ) : secretsConfigured() ? (
          <PaymentForm label="Save" />
        ) : (
          <p className="mt-2 text-sm text-muted">
            Payment details are temporarily unavailable — call your producer.
          </p>
        )}
      </section>
    </div>
  );
}
