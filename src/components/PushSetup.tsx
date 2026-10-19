"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Device = { id: number; label: string; added: string };

const toKey = (base64: string) => {
  const raw = atob((base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

// What kind of device this is, so the list says "iPhone" rather than a code.
const deviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows computer";
  return "Device";
};

// Turns on "new order" notifications for this phone (or computer).
export function PushSetup({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [support, setSupport] = useState<"checking" | "ok" | "install-first" | "no">("checking");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const ios = /iPhone|iPad/.test(navigator.userAgent);
    const installed = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const can = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- what this browser can do is only known in the browser
    setSupport(can ? "ok" : ios && !installed ? "install-first" : "no");
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setNote({ ok: res.ok, text: data.message ?? data.error ?? "Something went wrong" });
    return res.ok;
  }

  async function turnOn() {
    setBusy(true);
    setNote(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNote({ ok: false, text: "Notifications were blocked. Allow them for this site in your phone's settings, then try again." });
        return;
      }
      const reg = await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" });
      await navigator.serviceWorker.ready;
      const { publicKey } = await (await fetch("/api/admin/push")).json();
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey) }));
      if (await post({ subscription: sub.toJSON(), label: deviceName() })) router.refresh();
    } catch (err) {
      setNote({ ok: false, text: `Couldn't turn notifications on: ${err instanceof Error ? err.message : "unknown problem"}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-line bg-white p-5">
        <h3 className="font-display text-xl font-bold">This device</h3>
        {support === "checking" && <p className="mt-2 text-sm text-muted">Checking…</p>}
        {support === "install-first" && (
          <div className="mt-2 rounded-xl bg-[#fdf8e7] p-3 text-sm">
            <p className="font-semibold">On iPhone, add the admin to your home screen first:</p>
            <ol className="mt-1 list-decimal pl-5">
              <li>
                Tap the <strong>Share</strong> button (the square with an arrow) at the bottom of Safari.
              </li>
              <li>
                Tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
              </li>
              <li>
                Open <strong>PU Admin</strong> from your home screen, log in, and come back to this Notifications page.
              </li>
            </ol>
          </div>
        )}
        {support === "no" && <p className="mt-2 text-sm text-muted">This browser can&apos;t show notifications. Use Safari on iPhone or Chrome on Android.</p>}
        {support === "ok" && (
          <>
            <p className="mt-2 text-sm text-muted">Get a notification on this device the moment an order is paid. Tap it to open the order.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busy} className="btn btn-gold" onClick={turnOn}>
                {busy ? "Turning on…" : "Turn on notifications"}
              </button>
              {devices.length > 0 && (
                <button type="button" disabled={busy} className="btn btn-white" onClick={() => post({ action: "test" })}>
                  Send a test
                </button>
              )}
            </div>
          </>
        )}
        {note && <p className={`mt-3 text-sm font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{note.text}</p>}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h3 className="font-display text-xl font-bold">Devices getting notifications</h3>
        {devices.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <span className="block font-semibold">{d.label || "Device"}</span>
                  <span className="text-xs text-muted">Added {d.added}</span>
                </span>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#b42318] underline"
                  onClick={async () => {
                    if (await post({ action: "remove", id: d.id })) router.refresh();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
