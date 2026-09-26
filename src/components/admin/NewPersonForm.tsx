"use client";

import { useActionState, useState } from "react";
import { addPerson } from "@/app/admin/actions";
import { InvitationPreview } from "@/components/admin/InvitationPreview";
import { buildInvitation, type StaffEvent } from "@/data/admin";

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/50 focus:border-copper";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
      {children}
    </label>
  );
}

export function NewPersonForm({
  events,
  initialEventId,
  initialRoleId,
}: {
  events: StaffEvent[];
  initialEventId?: string;
  initialRoleId?: string;
}) {
  const [state, formAction, pending] = useActionState(addPerson, undefined);
  const getEvent = (id: string) => events.find((e) => e.id === id);
  const initialEvent = getEvent(initialEventId ?? "") ?? events[0];
  const initialRole =
    initialEvent.roles.find((r) => r.id === initialRoleId)?.id ?? initialEvent.roles[0]?.id ?? "";

  const [form, setForm] = useState({
    name: "",
    headline: "",
    city: "",
    email: "",
    phone: "",
    jobgetUrl: "",
    notes: "",
    eventId: initialEvent.id,
    roleId: initialRole,
  });
  const [highlights, setHighlights] = useState(["", "", ""]);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const event = getEvent(form.eventId);
  const invitation = buildInvitation({ ...form, highlights }, event);
  const canSave = form.name.trim().length > 1 && !pending;

  return (
    <form action={formAction}>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Add someone from JobGet</h1>
      <p className="mt-2 text-muted">
        Copy their details from their profile. The invitation writes itself as you type.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <Field label="Full name">
            <input
              name="name"
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Jannie Davis"
            />
          </Field>
          <Field label="What they do">
            <input
              name="headline"
              className={inputClass}
              value={form.headline}
              onChange={(e) => set("headline")(e.target.value)}
              placeholder="Catering lead, bartender, photographer…"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" hint="needed for their login">
              <input
                name="email"
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City">
              <input
                name="city"
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city")(e.target.value)}
                placeholder="Boston, MA"
              />
            </Field>
            <Field label="JobGet profile link" hint="optional">
              <input
                name="jobgetUrl"
                className={inputClass}
                value={form.jobgetUrl}
                onChange={(e) => set("jobgetUrl")(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Event">
              <select
                name="eventId"
                className={inputClass}
                value={form.eventId}
                onChange={(e) => {
                  const next = getEvent(e.target.value);
                  setForm((f) => ({
                    ...f,
                    eventId: e.target.value,
                    roleId: next?.roles[0]?.id ?? "",
                  }));
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.client} · {ev.city}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Role">
              <select
                name="roleId"
                className={inputClass}
                value={form.roleId}
                onChange={(e) => set("roleId")(e.target.value)}
              >
                {event?.roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="text-sm text-ink">
              Why them?
              <span className="ml-2 text-xs text-muted">up to 3 things from their profile</span>
            </legend>
            {highlights.map((value, i) => (
              <input
                key={i}
                name="highlight"
                className={inputClass}
                value={value}
                onChange={(e) =>
                  setHighlights((h) => h.map((x, j) => (j === i ? e.target.value : x)))
                }
                placeholder={
                  [
                    "Has managed catering events of 500+ guests",
                    "ServSafe Manager certified",
                    "Available evenings and weekends",
                  ][i]
                }
              />
            ))}
          </fieldset>

          <Field label="Private notes" hint="only your team sees these">
            <textarea
              name="notes"
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm text-muted">Their invitation</p>
          <div className="mt-2">
            <InvitationPreview
              subject={invitation.subject}
              body={invitation.body}
              email={form.email}
            />
          </div>

          {state?.error && <p className="mt-4 bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="invited"
              disabled={!canSave}
              className="bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-40"
            >
              Save · I&apos;ve sent it
            </button>
            <button
              type="submit"
              name="intent"
              value="later"
              disabled={!canSave}
              className="border border-ink/20 px-5 py-3 text-sm text-ink transition hover:border-ink disabled:opacity-40"
            >
              Save for later
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
