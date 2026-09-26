"use client";

import { useActionState, useState } from "react";
import { addEvent } from "@/app/admin/actions";

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-copper";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-ink">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
      {children}
    </label>
  );
}

export function NewEventForm({ producers }: { producers: { id: string; name: string; role: string }[] }) {
  const [state, action, pending] = useActionState(addEvent, undefined);
  const [roles, setRoles] = useState([{ key: 0 }]);

  return (
    <form action={action} className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">New event</h1>
      <p className="mt-2 text-muted">Add the event and the roles you need. Then add people for each role.</p>

      <div className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client">
            <input name="client" required className={inputClass} placeholder="Solstice Energy" />
          </Field>
          <Field label="Event name">
            <input name="name" required className={inputClass} placeholder="Fall Leadership Summit" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Date">
            <input name="date" type="date" required className={inputClass} />
          </Field>
          <Field label="Partners arrive" hint="optional">
            <input name="arriveTime" className={inputClass} placeholder="7:00 AM" />
          </Field>
          <Field label="Guests">
            <input name="guests" inputMode="numeric" className={inputClass} placeholder="400" />
          </Field>
        </div>
        <Field label="Venue">
          <input name="venue" required className={inputClass} placeholder="Moody Theater" />
        </Field>
        <Field label="Street address" hint="for partners' directions">
          <input name="address" className={inputClass} placeholder="310 W Willie Nelson Blvd, Austin, TX 78701" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-[1fr_6rem]">
          <Field label="City">
            <input name="city" required className={inputClass} placeholder="Austin" />
          </Field>
          <Field label="State">
            <input name="state" required maxLength={2} className={`${inputClass} uppercase`} placeholder="TX" />
          </Field>
        </div>
        <Field label="Producer">
          <select name="producerId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Pick who runs it
            </option>
            {producers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.role}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="border-t border-[var(--line)] pt-6">
          <legend className="font-display pr-3 text-lg text-ink">Roles to fill</legend>
          <div className="space-y-4">
            {roles.map((role, i) => (
              <div key={role.key} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
                <Field label={i === 0 ? "Role" : ""}>
                  <input name="roleTitle" className={inputClass} placeholder="Bartender" />
                </Field>
                <Field label={i === 0 ? "What they'll do" : ""} hint={i === 0 ? "finishes “We need someone to…”" : undefined}>
                  <input name="roleBrief" className={inputClass} placeholder="serve drinks at the evening reception" />
                </Field>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRoles((r) => r.filter((x) => x.key !== role.key))}
                    className="px-2 py-2.5 text-sm text-muted hover:text-ink"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRoles((r) => [...r, { key: Date.now() }])}
            className="mt-4 text-sm text-copper"
          >
            + Add another role
          </button>
        </fieldset>
      </div>

      {state?.error && <p className="mt-6 bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 bg-copper px-6 py-3.5 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create event"}
      </button>
    </form>
  );
}
