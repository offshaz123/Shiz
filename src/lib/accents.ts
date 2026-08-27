export type AccentTheme = {
  id: string;
  label: string;
  purple: string;
  pink: string;
  orange: string;
};

// Three-stop gradient themes — the middle ("pink") stop also drives every
// solid accent use (links, badges, icons) via the `--color-brand` token.
// "Ocean Blue" matches the SMG Details site's palette and is the default.
export const accentThemes: AccentTheme[] = [
  { id: "ocean", label: "Ocean Blue", purple: "#0f5f8c", pink: "#0ea5c4", orange: "#f2a922" },
  { id: "gold", label: "Gold", purple: "#8a6d1a", pink: "#c9a227", orange: "#e8c766" },
  { id: "crimson", label: "Crimson", purple: "#7a0d14", pink: "#b3121c", orange: "#e8593f" },
  { id: "emerald", label: "Emerald", purple: "#0b4a30", pink: "#146c43", orange: "#3fae7a" },
  { id: "purple", label: "Royal Purple", purple: "#3d0f66", pink: "#6b21a8", orange: "#a855c9" },
  { id: "graphite", label: "Graphite", purple: "#26292e", pink: "#4b5563", orange: "#8b97a3" },
];

export const defaultAccentTheme = accentThemes[0];

export const ACCENT_STORAGE_KEY = "etr-accent-theme";

// Inlined into a blocking <script> in the document body so the picked theme
// applies before first paint instead of flashing the default.
export const accentInitScript = `
try {
  var id = localStorage.getItem("${ACCENT_STORAGE_KEY}");
  var themes = ${JSON.stringify(accentThemes)};
  var t = themes.filter(function (x) { return x.id === id; })[0];
  if (t) {
    var root = document.documentElement.style;
    root.setProperty("--brand-purple", t.purple);
    root.setProperty("--brand-pink", t.pink);
    root.setProperty("--brand-orange", t.orange);
  }
} catch (e) {}
`;
