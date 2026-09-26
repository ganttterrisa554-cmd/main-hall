"use client";

import { useState } from "react";

export function SignBox({
  expectedName,
  date,
  prompt = "Type your full name to sign this agreement.",
  button = "Sign",
  done = "Signed",
}: {
  expectedName: string;
  date: string;
  prompt?: string;
  button?: string;
  done?: string;
}) {
  const [name, setName] = useState("");
  const [signed, setSigned] = useState(false);

  if (signed) {
    return (
      <p className="bg-emerald-600/10 px-4 py-3 text-sm text-emerald-800">
        {done} by {name} on {date}. A copy has been saved to your portal.
      </p>
    );
  }

  return (
    <div className="border border-[var(--line)] bg-mist p-5">
      <p className="text-sm text-ink">{prompt}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={expectedName}
          className="flex-1 border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/50 focus:border-copper"
        />
        <button
          type="button"
          disabled={name.trim().length < 3}
          onClick={() => setSigned(true)}
          className="bg-ink px-5 py-2.5 text-sm font-medium text-mist transition hover:bg-ink-soft disabled:opacity-40"
        >
          {button}
        </button>
      </div>
    </div>
  );
}
