/**
 * One definition of a good enough password, used by the sign-up form, the
 * sign-up route, the change-password route and the reset route.
 *
 * It lives on its own because the browser copy and the server copy must not
 * drift: the form's ticks are a courtesy, the server's check is the one that
 * decides.
 */
export const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "At least one uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "At least one lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "At least one number", test: (v: string) => /\d/.test(v) },
  { label: "At least one symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordProblem(password: string) {
  const failed = passwordRules.find((rule) => !rule.test(password));
  return failed ? `Password needs: ${failed.label.toLowerCase()}.` : null;
}
