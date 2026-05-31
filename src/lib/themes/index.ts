import type { ThemeDefinition, ThemeSyntaxOverrides, ThemeSyntaxStyles } from "../types";
import { punkTheme } from "./punk";
import { popArtTheme } from "./pop-art";
import { memphisTheme } from "./memphis";
import { iphoneNotesTheme } from "./iphone-notes";
import { notebookGridTheme } from "./notebook-grid";
import { japaneseMinimalTheme } from "./japanese-minimal";
import { cleanEditorialTheme } from "./clean-editorial";
import { softMagazineTheme } from "./soft-magazine";
import { highContrastPosterTheme } from "./high-contrast-poster";
import { minimalistTheme } from "./minimalist";
import { elegantVintageTheme } from "./elegant-vintage";
import { futuristicTechTheme } from "./futuristic-tech";
import { scandinavianTheme } from "./scandinavian";
import { artDecoTheme } from "./art-deco";
import { cyberpunkTheme } from "./cyberpunk";
import { vaporwaveTheme } from "./vaporwave";
import { bauhausTheme } from "./bauhaus";
import { constructivismTheme } from "./constructivism";
import { victorianTheme } from "./victorian";
import { neoBaroqueTheme } from "./neo-baroque";
import { germanExpressionismTheme } from "./german-expressionism";

export const themes: ThemeDefinition[] = [
  punkTheme,
  popArtTheme,
  memphisTheme,
  iphoneNotesTheme,
  notebookGridTheme,
  japaneseMinimalTheme,
  cleanEditorialTheme,
  softMagazineTheme,
  highContrastPosterTheme,
  minimalistTheme,
  elegantVintageTheme,
  futuristicTechTheme,
  scandinavianTheme,
  artDecoTheme,
  cyberpunkTheme,
  vaporwaveTheme,
  bauhausTheme,
  constructivismTheme,
  victorianTheme,
  neoBaroqueTheme,
  germanExpressionismTheme,
];

export const defaultTheme = themes.find((theme) => theme.id === "memphis") ?? themes[0];

export function getThemeById(id: string): ThemeDefinition {
  return themes.find((theme) => theme.id === id) ?? defaultTheme;
}

export function resolveThemeSyntax(
  theme: ThemeDefinition,
  overrides: ThemeSyntaxOverrides = {},
): ThemeSyntaxStyles {
  return { ...theme.syntax, ...overrides };
}
