import type { Metadata } from "next";
import Link from "next/link";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { pbxId } from "@/lib/settings";
import { isConnected } from "@/lib/zadarma";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phone setup",
  robots: { index: false, follow: false },
};

/**
 * How to get the phone working on your own laptop.
 *
 * Written for somebody who has done it once, forgotten, and come back
 * six weeks later — which is the normal case and the reason this page
 * exists at all. It was a conversation on WhatsApp before this, which
 * means it was lost.
 *
 * Their own numbers are filled in from their account, because the part
 * people get wrong is not the downloading. It is the login, which is
 * not the extension on its own but the account number and the
 * extension joined with a hyphen, and nobody can guess their own.
 *
 * The one thing deliberately not on this page is the password. It is
 * not held anywhere in this system and it is not going to be: a page
 * that shows somebody's SIP password is a page that turns one borrowed
 * laptop into somebody else's phone bill.
 */
export default async function PhonePage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "phone")) return <NotYours page="phone" />;

  const pbx = await pbxId();
  const extension = who.extension;
  const login = pbx && extension ? `${pbx}-${extension}` : "";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <AdminHeading title="Phone setup">
        How to get the calling app on your laptop and make it ring. Come back to this page any
        time — nothing here changes.
      </AdminHeading>

      {/* Their own settings, first, because that is what they came for. */}
      <section id="your-details" className="mt-8 scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Your own settings</h2>
        <p className="mt-1 text-xs text-muted">
          These are yours. Somebody else&apos;s will be different.
        </p>

        <dl className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-baseline gap-x-4 border-b border-border px-4 py-3">
            <dt className="w-40 shrink-0 text-xs font-semibold text-muted">Your name</dt>
            <dd className="text-sm font-bold text-foreground">{who.name}</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 border-b border-border px-4 py-3">
            <dt className="w-40 shrink-0 text-xs font-semibold text-muted">Your extension</dt>
            <dd className="text-sm font-bold tabular-nums text-foreground">
              {extension || (
                <span className="font-normal text-red-400">
                  Not set yet — ask Walid to put it on your account
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 border-b border-border px-4 py-3">
            <dt className="w-40 shrink-0 text-xs font-semibold text-muted">Username to type in</dt>
            <dd className="text-sm font-bold tabular-nums text-foreground">
              {login || (
                <span className="font-normal text-red-400">
                  {extension
                    ? "The phone account number has not been filled in yet — ask Walid"
                    : "Needs your extension first"}
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 border-b border-border px-4 py-3">
            <dt className="w-40 shrink-0 text-xs font-semibold text-muted">Server / domain</dt>
            <dd className="text-sm font-bold text-foreground">pbx.zadarma.com</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 px-4 py-3">
            <dt className="w-40 shrink-0 text-xs font-semibold text-muted">Password</dt>
            <dd className="text-sm text-foreground">
              Ask Walid. It is not kept on this site and it never will be.
            </dd>
          </div>
        </dl>

        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-foreground">
          Never send that password in a message, and never screenshot it. Anybody who gets it can
          make calls that land on our bill. If you think somebody has seen it, say so and it will
          be changed — that costs five minutes and nothing else.
        </p>
      </section>

      {/* The download, split by what laptop they have. */}
      <section id="download" className="mt-10 scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">1. Download the app</h2>
        <p className="mt-1 text-xs text-muted">
          The phone system does not have its own desktop app, so you use a standard calling app
          that works with it. Pick the one for your laptop.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-bold text-foreground">Windows</p>
            <p className="mt-1 text-xs text-muted">
              MicroSIP. Small, free, and the one the phone company writes its own instructions
              for.
            </p>
            <a
              href="https://www.microsip.org/downloads"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block rounded-lg border border-brand-pink px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              microsip.org/downloads ↗
            </a>
            <p className="mt-2 text-[11px] text-muted">
              Get the normal version, not the Lite one. Run it once it has downloaded.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-bold text-foreground">Mac</p>
            <p className="mt-1 text-xs text-muted">
              Zoiper. Free version is enough — it will offer you a paid one, you do not need it.
            </p>
            <a
              href="https://www.zoiper.com/en/voip-softphone/download/zoiper5"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block rounded-lg border border-brand-pink px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              zoiper.com ↗
            </a>
            <p className="mt-2 text-[11px] text-muted">
              Zoiper also works on Windows if MicroSIP gives you trouble.
            </p>
          </div>
        </div>
      </section>

      {/* The settings, which is where it actually goes wrong. */}
      <section id="sign-in" className="mt-10 scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">2. Sign in</h2>
        <p className="mt-1 text-xs text-muted">
          This is the part people get wrong. The username is not just your extension.
        </p>

        <ol className="mt-4 flex list-decimal flex-col gap-2.5 pl-5 text-sm leading-relaxed text-foreground">
          <li>
            Open the app and find where it asks you to add an account. In MicroSIP it is the menu
            button, then <span className="font-semibold">Add account</span>. In Zoiper it asks you
            as soon as it opens.
          </li>
          <li>
            For username or login, type{" "}
            <span className="font-bold tabular-nums">{login || "your full login from above"}</span>
            . The part before the hyphen is the company account, the part after is you.
          </li>
          <li>
            For domain, server or host, type{" "}
            <span className="font-bold">pbx.zadarma.com</span> in every box that asks for one.
          </li>
          <li>Put the password in. Ask Walid for it if you do not have it.</li>
          <li>
            Save. Within a few seconds it should say <span className="font-semibold">Online</span>,{" "}
            <span className="font-semibold">Registered</span> or{" "}
            <span className="font-semibold">Available</span>, depending on the app. That word is
            the whole thing — if it says that, you are done.
          </li>
        </ol>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          If it will not connect, there is usually a transport setting with UDP and TCP in it. Try
          the other one. That fixes it more often than anything else.
        </p>
      </section>

      {/* What actually happens when they press Call. */}
      <section id="how-it-works" className="mt-10 scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">3. How calling actually works</h2>
        <p className="mt-1 text-xs text-muted">
          It is not what most people expect the first time, so it is worth reading once.
        </p>

        <ol className="mt-4 flex list-decimal flex-col gap-2.5 pl-5 text-sm leading-relaxed text-foreground">
          <li>
            Leave the calling app open and signed in. If it is closed, nothing can reach you and
            the Call button will not work.
          </li>
          <li>
            On{" "}
            <Link href="/admin/prospects" className="font-semibold underline hover:text-brand-pink">
              Who to call
            </Link>
            , press <span className="font-semibold">Call</span> on a business.
          </li>
          <li>
            <span className="font-semibold">Your app rings first.</span> Answer it. You will hear
            ringing — that is the business being dialled. Nobody is on the line yet, so do not
            start talking.
          </li>
          <li>When they pick up, you are connected. Talk normally.</li>
          <li>
            When the call ends, a box opens on the row asking what happened. Fill it in before you
            ring the next one. It takes fifteen seconds and it is the whole reason any of this is
            worth doing.
          </li>
        </ol>

        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          The number the business sees is the company number, not yours. Your own number is never
          shown to anybody you ring.
        </p>
      </section>

      {/* The things that go wrong, in the order they go wrong. */}
      <section id="when-it-breaks" className="mt-10 scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">When it does not work</h2>

        <dl className="mt-4 flex flex-col gap-3">
          {[
            {
              q: "There is no Call button on the business",
              a: "Either your extension is not set on your account, or the phone system is not connected at this end. Your extension is at the top of this page — if it says not set, that is the reason.",
            },
            {
              q: "The app says Offline, or will not register",
              a: "Nine times out of ten the username is wrong. It has to be the full one with the hyphen, not just your extension. After that, try switching UDP to TCP.",
            },
            {
              q: "I pressed Call and nothing rang",
              a: "Check the app is open and says Online. If it is, your laptop may have gone to sleep — wake it and try again.",
            },
            {
              q: "It rang me but the business never answered",
              a: "That is a normal call that nobody picked up. Write it up as No answer and move on. If the number itself does not work at all, use Number doesn't work instead, so nobody wastes time ringing it again.",
            },
            {
              q: "The sound is bad or breaking up",
              a: "Use a headset rather than the laptop speakers, and get off the wifi onto a cable if you can. Most bad calls are the connection at one end, not the phone system.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-border bg-surface px-4 py-3">
              <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>

        {!isConnected() && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-xs text-foreground">
            The phone system is not connected to this site at the moment, so the Call button will
            not appear for anybody until that is sorted.
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Still stuck after all that, message Walid on {siteConfig.phoneDisplay}. Tell him what the app
          says on its status line — that one word is what tells anybody where the problem is.
        </p>
      </section>
    </main>
  );
}
