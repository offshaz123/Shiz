"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * The security check on the enquiry form.
 *
 * A five-character code, painted to a canvas and retyped to submit.
 *
 * Canvas rather than SVG text on purpose: SVG <text> keeps the characters in
 * the DOM, where document.querySelector reads them straight back out and the
 * check is decorative. Pixels cannot be read that way without OCR.
 *
 * It stops the scripted form scrapers that account for most junk. It is not a
 * defence against anyone who has decided to target this form specifically —
 * OCR on five clean characters is not hard. If that starts happening, swap it
 * for Cloudflare Turnstile: free, invisible to the reader, genuinely
 * adversarial, and validated server-side, which this cannot be.
 *
 * Two deliberate details:
 *
 *  - One of each confusable pair is dropped: no O, I, L or S, and no 0 or 1.
 *    A check that fails because the reader could not tell an I from a 1 is not
 *    a security measure, it is a lost enquiry.
 *  - Comparison ignores case and spaces, for the same reason.
 *
 * Accessibility: this is a visual puzzle, so it locks out anyone who cannot
 * see it. The refresh button helps, and the form sits beside a phone number
 * and an email address on every page that carries it — that is the accessible
 * route, and it needs to stay.
 */
const ALPHABET = "ABCDEFGHJKMNPQRTUVWXYZ23456789";
const LENGTH = 5;

function makeCode() {
  let code = "";
  for (let i = 0; i < LENGTH; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

const normalise = (value: string) => value.replace(/\s/g, "").toUpperCase();

/** CSS pixels; the canvas is drawn at twice this for retina screens. */
const CANVAS = { width: 162, height: 48 };

function paint(canvas: HTMLCanvasElement, code: string) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue("--foreground").trim() || "#0b1a20";
  const accent = styles.getPropertyValue("--accent").trim() || "#069ec1";

  context.setTransform(2, 0, 0, 2, 0, 0);
  context.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // Noise first, so it sits under the characters rather than over them.
  context.strokeStyle = accent;
  context.globalAlpha = 0.22;
  context.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    const y = 11 + i * 12;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(40, y + (i % 2 ? 14 : -12), 110, y + (i % 2 ? -12 : 14), CANVAS.width, y);
    context.stroke();
  }

  context.globalAlpha = 1;
  context.fillStyle = ink;
  context.textBaseline = "middle";

  code.split("").forEach((character, index) => {
    const x = 20 + index * 30;
    context.save();
    context.translate(x, CANVAS.height / 2);
    context.rotate((((index % 2 ? 1 : -1) * (5 + index * 2)) * Math.PI) / 180);
    // A concrete stack, not a CSS variable: canvas does not resolve custom
    // properties inside the font shorthand, and silently falls back to a thin
    // default if you try.
    context.font = `700 ${26 + (index % 3)}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif`;
    context.fillText(character, -10, index % 2 ? 2 : -2);
    context.restore();
  });
}

export function SecurityCheck({
  onChange,
  showError,
}: {
  /** Fires whenever the typed answer starts or stops matching. */
  onChange: (valid: boolean) => void;
  showError: boolean;
}) {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState("");
  const [typed, setTyped] = useState("");

  // Generated on the client only: rendering it on the server would ship the
  // answer in the prerendered HTML and put the same code in front of every
  // visitor. Deferred a frame so the first code is set outside hydration.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCode(makeCode()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Repainted whenever the code changes, including the first one.
  useEffect(() => {
    if (code && canvasRef.current) paint(canvasRef.current, code);
  }, [code]);

  const refresh = useCallback(() => {
    setCode(makeCode());
    setTyped("");
    onChange(false);
  }, [onChange]);

  const handleTyped = (value: string) => {
    setTyped(value);
    onChange(Boolean(code) && normalise(value) === code);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor={inputId}>
        Security check — type the code *
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <canvas
          ref={canvasRef}
          width={CANVAS.width * 2}
          height={CANVAS.height * 2}
          role="img"
          aria-label="A five-character code, shown as a picture"
          className="h-12 w-[162px] rounded-lg border border-border bg-surface-2"
        />

        <input
          id={inputId}
          name="securityCheck"
          value={typed}
          onChange={(event) => handleTyped(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          required
          aria-describedby={showError ? `${inputId}-error` : undefined}
          className="w-32 rounded-lg border border-border bg-background px-3.5 py-2.5 text-center font-mono text-sm uppercase tracking-[0.2em] text-foreground outline-none transition-colors focus:border-accent"
        />

        <button
          type="button"
          onClick={refresh}
          className="text-xs font-semibold text-accent-2 underline-offset-4 hover:underline"
        >
          New code
        </button>
      </div>

      {showError && (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-muted">
          That code does not match. Try again, or get a new one — or just call us instead.
        </p>
      )}
    </div>
  );
}
