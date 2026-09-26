"use client";

import { useEffect } from "react";

export default function ErrorScreen({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-ink">That page didn&apos;t load</h1>
      <p className="mt-3 text-muted">
        Usually this is a brief connection problem. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 bg-copper px-5 py-3 text-sm font-medium text-mist transition hover:bg-copper-bright"
      >
        Try again
      </button>
    </div>
  );
}
