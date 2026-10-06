"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { sendChatMessage } from "@/app/partners/actions";

type ChatMessage = {
  id: string;
  direction: "in" | "out";
  body: string;
  authorName: string;
  readAt: string | null;
  createdAt: string;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function ChatFloater() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadOut, setUnreadOut] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLUListElement>(null);
  const lastSeenRef = useRef("");
  const idleRef = useRef(0);

  const load = useCallback(async (markRead: boolean) => {
    try {
      const res = await fetch(`/partners/api/chat${markRead ? "?read=1" : ""}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMessage[]; unreadOut: number };
      setMessages(data.messages);
      setUnreadOut(data.unreadOut);
      lastSeenRef.current = data.messages.length ? data.messages[data.messages.length - 1].createdAt : "";
    } catch {
      // portal stays usable if a refresh fails
    }
  }, []);

  useEffect(() => {
    idleRef.current = 0;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const steps = open ? [15_000, 30_000, 60_000] : [60_000, 120_000, 300_000];
    const delay = () => steps[Math.min(Math.floor(idleRef.current / 4), steps.length - 1)];

    const tick = async () => {
      if (!alive) return;
      if (document.visibilityState === "visible") {
        const prev = lastSeenRef.current;
        await load(open);
        idleRef.current = lastSeenRef.current === prev ? idleRef.current + 1 : 0;
      }
      timer = setTimeout(tick, delay());
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      idleRef.current = 0;
      clearTimeout(timer);
      timer = setTimeout(tick, 0);
    };

    document.addEventListener("visibilitychange", onVisible);
    timer = setTimeout(tick, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [open, load]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, open]);

  const send = () => {
    const body = draft.trim();
    if (!body || pending) return;
    setDraft("");
    setError("");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        direction: "in",
        body,
        authorName: "You",
        readAt: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    startTransition(async () => {
      const form = new FormData();
      form.set("body", body);
      const result = await sendChatMessage(undefined, form);
      if (result?.error) {
        setError(result.error);
        setDraft(body);
      }
      idleRef.current = 0;
      await load(true);
    });
  };

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-50 flex max-h-96 w-80 max-w-[calc(100vw-2rem)] flex-col border border-[var(--line)] bg-white shadow-xl print:hidden sm:right-5">
          <p className="border-b border-[var(--line)] px-4 py-3 font-display text-base text-ink">
            Chat with Main Hall
          </p>
          <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <li className="py-6 text-center text-sm text-muted">
                No messages yet — questions about your booking go here.
              </li>
            )}
            {messages.map((m) => (
              <li key={m.id} className={m.direction === "in" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block max-w-[85%] px-3 py-2 text-left text-sm leading-relaxed whitespace-pre-wrap ${
                    m.direction === "in" ? "bg-copper/10 text-ink" : "bg-stone/70 text-ink"
                  }`}
                >
                  {m.body}
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  {m.authorName || (m.direction === "in" ? "You" : "Main Hall")} · {formatTime(m.createdAt)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--line)] p-3">
            {error && <p className="mb-2 bg-red-600/10 px-3 py-2 text-xs text-red-800">{error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Write a message…"
                className="max-h-24 flex-1 resize-none border border-[var(--line)] px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/50 focus:border-copper"
              />
              <button
                type="button"
                onClick={send}
                disabled={pending || !draft.trim()}
                className="bg-copper px-4 py-2 text-sm font-medium text-mist transition hover:bg-copper-bright disabled:opacity-50"
              >
                {pending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load(true);
        }}
        aria-label={open ? "Close chat" : "Chat with Main Hall"}
        className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-copper text-mist shadow-lg transition hover:bg-copper-bright print:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {unreadOut > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-medium text-white">
            {unreadOut > 9 ? "9+" : unreadOut}
          </span>
        )}
      </button>
    </>
  );
}
