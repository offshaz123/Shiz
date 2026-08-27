export type Accent = {
  id: string;
  label: string;
  hex: string;
};

// Solid, high-contrast accent colours only — every one of these needs to
// carry white button text and read clearly against both black and white.
export const accents: Accent[] = [
  { id: "gold", label: "Gold", hex: "#c9a227" },
  { id: "red", label: "Red", hex: "#b3121c" },
  { id: "blue", label: "Blue", hex: "#1450a3" },
  { id: "emerald", label: "Emerald", hex: "#146c43" },
  { id: "purple", label: "Purple", hex: "#6b21a8" },
  { id: "graphite", label: "Graphite", hex: "#4b5563" },
];

export const defaultAccent = accents[0];

export const ACCENT_STORAGE_KEY = "etr-accent";

// Inlined into a blocking <script> in the document body so the picked accent
// applies before first paint instead of flashing the default gold.
export const accentInitScript = `
try {
  var a = localStorage.getItem("${ACCENT_STORAGE_KEY}");
  if (a) document.documentElement.style.setProperty("--brand", a);
} catch (e) {}
`;
