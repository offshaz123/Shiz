import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { getClientLogo } from "@/lib/clients";
import { AppInstructions } from "@/components/AppInstructions";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get the app",
  robots: { index: false, follow: false },
};

/**
 * Putting the portal on a phone's home screen.
 *
 * A page as well as the banner, because a banner can only be dismissed.
 * Somebody who swiped it away in March and wants the app in June had
 * nowhere to go; now there is a door that stays open.
 *
 * It does not claim an App Store download, because there is not one. What
 * there is behaves like an app once it is on the home screen — its own
 * icon, no address bar, straight to the dashboard — and saying exactly
 * that is better than two store badges that lead nowhere.
 */
export default async function AppPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const logo = await getClientLogo(client.id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Put it on your phone
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Two taps and {client.name} sits on your home screen like any other app — your own icon,
        no address bar, straight to your figures. It is the same thing you are looking at now,
        so there is nothing to download and nothing to sign into again.
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl border border-border object-contain"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border text-2xl font-bold text-muted">
            {client.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-bold text-foreground">{client.name}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {logo
              ? "This is the icon it will have."
              : "Add your logo in Business details and that becomes the icon."}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <AppInstructions />
      </div>

      <section className="mt-7 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">What you can do in it</h2>
        <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-muted">
          <li>See your enquiries the moment they come in, and mark them answered.</li>
          <li>Check what is booked this week and add a job standing next to the van.</li>
          <li>Write a quote on the driveway and email it before you have left.</li>
          <li>Turn a yes into an invoice, take the money, and send the receipt.</li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Reminders about tomorrow&rsquo;s jobs come by email rather than as phone alerts. On an
          iPhone a web app can only send alerts once it is on the home screen and you have
          agreed to them, and an email that definitely arrives beats an alert that might not.
        </p>
      </section>
    </div>
  );
}
