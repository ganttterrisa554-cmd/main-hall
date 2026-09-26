"use client";

import { useActionState } from "react";

type State = { error?: string; ok?: string } | undefined;

const inputClass =
  "mt-1.5 w-full border border-[var(--line)] bg-white px-3 py-3 text-ink outline-none transition focus:border-copper";

export function LoginForm({
  action,
  next,
  emailPlaceholder,
}: {
  action: (state: State, form: FormData) => Promise<State>;
  next?: string;
  emailPlaceholder?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block">
        <span className="text-sm text-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={emailPlaceholder}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-copper px-5 py-3.5 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export function PasswordForm({
  action,
  next,
  minLength,
  button,
}: {
  action: (state: State, form: FormData) => Promise<State>;
  next?: string;
  minLength: number;
  button: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-sm space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block">
        <span className="text-sm text-ink">New password</span>
        <span className="ml-2 text-xs text-muted">at least {minLength} characters</span>
        <input name="password" type="password" required minLength={minLength} autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm text-ink">Type it again</span>
        <input name="confirm" type="password" required minLength={minLength} autoComplete="new-password" className={inputClass} />
      </label>
      {state?.error && <p className="bg-red-600/10 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      {state?.ok && <p className="bg-emerald-600/10 px-3 py-2 text-sm text-emerald-900">{state.ok}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-copper px-5 py-3.5 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
      >
        {pending ? "Saving…" : button}
      </button>
    </form>
  );
}
