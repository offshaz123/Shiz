"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/site-config";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: `Hi! I'm the SMG Details assistant. Ask me about tinting, wrapping, servicing, plates or alloys — or message us on WhatsApp at ${siteConfig.phoneDisplay} to book.`,
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.sessionStorage.getItem("smg_chat_session");
    if (existing) {
      sessionIdRef.current = existing;
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current || undefined,
          history: nextMessages.slice(0, -1).slice(-10),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Sorry, something went wrong. Please try WhatsApp instead." },
        ]);
        return;
      }

      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
        window.sessionStorage.setItem("smg_chat_session", data.sessionId);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try WhatsApp instead." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl sm:bottom-28 sm:left-7">
          <div className="brand-gradient-bg flex items-center justify-between px-5 py-4 text-white">
            <div>
              <p className="text-sm font-semibold">SMG Details Assistant</p>
              <p className="text-xs opacity-80">Usually replies instantly</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto rounded-tr-sm brand-gradient-bg text-white"
                    : "rounded-tl-sm bg-surface-2 text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[60%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-2.5 text-sm text-muted">
                Typing...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border bg-surface p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a service..."
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand-pink focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="brand-gradient-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                <path d="M4 12h16m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Chat with our AI assistant"}
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full brand-gradient-bg shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:bottom-7 sm:left-7"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
            <path
              d="M4 12a8 8 0 1 1 3.2 6.4L4 19.5l1.1-3.4A7.96 7.96 0 0 1 4 12Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}
