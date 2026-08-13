// Shared types for LinkHub feature

export type ThemeConfig = {
  background: string;
  buttonStyle: "pill" | "square" | "outline";
  fontFamily: string;
  textColor: string;
  accentColor: string;
};

export type ResolvedTheme = ThemeConfig;

export const DEFAULT_THEME: ThemeConfig = {
  background: "#ffffff",
  buttonStyle: "pill",
  fontFamily: "Inter, sans-serif",
  textColor: "#111111",
  accentColor: "#3b82f6",
};

export function mergeTheme(base: Partial<ThemeConfig>, override: Partial<ThemeConfig>): ResolvedTheme {
  return { ...DEFAULT_THEME, ...base, ...override };
}
