import { Logo } from "@/components/Logo";
import { clientLogin } from "./actions";

/**
 * The client's way in.
 *
 * Either their account name or their email address, because the two are
 * sent to them in the same message and nobody remembers which one the box
 * wanted. The account name is matched forgivingly — case, spaces and
 * missing hyphens all folded away.
 *
 * The box turns off autocapitalise, autocorrect and spellcheck, which is
 * not a nicety. On a phone the keyboard capitalises the first letter of a
 * field by default and autocorrect rewrites a word it does not know, so an
 * account name typed correctly can arrive as something else entirely and
 * the person has no way to see that it happened.
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
          <span className="text-xs font-medium text-muted">Account name or email</span>
          <input
            name="slug"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
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
            That did not work. Try your email address instead, or give us a ring and we will
            reset it.
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
