export const CARD_STYLES = [
  { id: "crystal", name: "Crystal", description: "Clear case · collectible finish" },
  { id: "electric", name: "Electric", description: "Bold blue · sculpted frame" },
  { id: "paper", name: "Studio", description: "Warm paper · editorial type" },
  { id: "aura", name: "Aura", description: "Soft glow · light theme" },
  { id: "retro", name: "Retro", description: "Windows 95 · pixel chrome" },
] as const;
export type CardStyle = typeof CARD_STYLES[number]["id"];
export function isCardStyle(value: unknown): value is CardStyle {
  return typeof value === "string" && CARD_STYLES.some((style) => style.id === value);
}
export function resolveCardStyle(value: unknown): CardStyle {
  return isCardStyle(value) ? value : "crystal";
}
