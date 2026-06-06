import type { ThemeSyntaxStyles } from "../types";

export function syntax(colors: {
  foreground: string;
  accent: string;
  secondary: string;
  muted: string;
  border: string;
  panel: string;
}, imageRadius = 18): ThemeSyntaxStyles {
  return {
    headingColor: colors.foreground,
    headingBackground: colors.secondary,
    strongColor: colors.accent,
    emphasisColor: colors.foreground,
    deleteColor: colors.border,
    highlightBackground: colors.secondary,
    highlightColor: colors.foreground,
    codeBackground: colors.muted,
    codeColor: colors.foreground,
    quoteBackground: colors.panel,
    listMarkerColor: colors.accent,
    tableBorderColor: colors.border,
    tableHeaderBackground: colors.secondary,
    tableHeaderColor: colors.foreground,
    tableRowBackground: colors.panel,
    tableAlternateRowBackground: colors.muted,
    imageBorderColor: colors.border,
    imageRadius,
  };
}
