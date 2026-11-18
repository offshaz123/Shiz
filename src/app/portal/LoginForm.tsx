import { Logo } from "@/components/Logo";
import { clientLogin } from "./actions";

/**
 * The client's way in.
 *
 * Their account name rather than an email address, because it is the thing
 * printed on their invoice and the thing in their dashboard URL, and
 * because an email box invites somebody to try their own address and
 * conclude the system is broken when it does not work.
 *
 * It carries the mark because the portal does not sit inside the website's
 * header any more: with no chrome at all, a password box on a dark screen
 * gives nobody a reason to believe it is ours.
 */
export function LoginForm({ failed }: { failed: boolean }) {
  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Your results</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Sign in to see your enquiries, what they cost and where they came from.
      </p>

      <form action={clientLogin} className="mt-8 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Account name</span>
          <input
            name="slug"
            autoComplete="username"
            required
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand-pink"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand-pink"
          />
        </label>

        {failed && (
          <p className="text-sm font-medium text-red-500">
            That did not work. Check the account name and password, or ask us to reset it.
          </p>
        )}

        <button
          type="submit"
          className="brand-gradient-bg mt-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
