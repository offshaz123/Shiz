// Lays out the characters on a plate the way real UK plates are made
// (BS AU 145e), in millimetres. Used by the website preview and the plate
// pictures in emails so they always match.

// Character size and spacing on a standard car plate.
export const CHAR_H = 79;
export const CHAR_W = 50;
export const GAP = 11;
export const GROUP_GAP = 33;
export const MARGIN = 11;

// Barlow Condensed SemiBold (the preview font): capitals are 0.7em tall, so
// this font size gives 79mm characters.
const CAP = 0.7;
export const LEGAL_FONT = CHAR_H / CAP;

// How wide each character is in that font, in em.
const ADVANCE: Record<string, number> = {
  A: 0.456, B: 0.462, C: 0.457, D: 0.472, E: 0.435, F: 0.415, G: 0.462, H: 0.477, I: 0.224, J: 0.443,
  K: 0.477, L: 0.415, M: 0.538, N: 0.507, O: 0.467, P: 0.457, Q: 0.455, R: 0.461, S: 0.434, T: 0.452,
  U: 0.478, V: 0.471, W: 0.665, X: 0.46, Y: 0.456, Z: 0.406, "0": 0.45, "1": 0.274, "2": 0.425, "3": 0.426,
  "4": 0.459, "5": 0.428, "6": 0.429, "7": 0.392, "8": 0.434, "9": 0.423, " ": 0.2, "&": 0.581, "!": 0.269,
  "?": 0.413, "'": 0.152, ".": 0.211, "-": 0.325,
};
const advance = (ch: string) => ADVANCE[ch] ?? 0.46;

export type Cell = {
  ch: string;
  // Centre of the character, in mm from the start of the registration.
  centre: number;
  // Below 1 when the character is wider than 50mm in this font (e.g. W, M)
  // and is squeezed to fit its space, like the real plate font.
  squeeze: number;
};

// A road-legal registration: every character gets a 50mm space, 11mm apart,
// with 33mm between the two groups (e.g. "AB12" and "CDE").
export function legalLayout(reg: string) {
  const cells: Cell[] = [];
  let x = 0;
  reg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((group, gi) => {
      [...group].forEach((ch, ci) => {
        if (ci > 0) x += GAP;
        else if (gi > 0) x += GROUP_GAP;
        cells.push({ ch, centre: x + CHAR_W / 2, squeeze: Math.min(1, CHAR_W / (advance(ch) * LEGAL_FONT)) });
        x += CHAR_W;
      });
    });
  return { width: x, cells };
}

// Show plates keep the customer's own spacing in the normal font: as big as
// road-legal characters, but smaller if needed to fit the plate.
export function showFontSize(text: string, available: number, letterSpacing: number) {
  const em = [...text].reduce((n, ch) => n + advance(ch), 0) || 1;
  return Math.min(LEGAL_FONT, (available - letterSpacing * Math.max(text.length - 1, 0)) / em);
}
