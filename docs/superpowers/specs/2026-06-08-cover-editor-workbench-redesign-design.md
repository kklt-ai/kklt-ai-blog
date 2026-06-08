# Cover Editor Workbench Redesign

Date: 2026-06-08

## Scope

Redesign the visual layout of the `/cover` editor only. The exported cover templates, template data, layer model, export behavior, and canvas content styles remain unchanged except for editor-only selection, panel, and control chrome.

## Design Direction

The cover editor should feel like a professional design software workbench using `DESIGN.md` as the visual reference. The interface should be denser, calmer, and more precise than the current gray tool UI.

Use the Mistral-inspired design tokens from `DESIGN.md`:

- Warm cream workspace surfaces: `#fff8e0`, `#fffaeb`, and white panels.
- Saturated orange primary actions: `#fa520f`.
- Ink text: `#1f1f1f` with softer grays for secondary labels.
- Thin borders instead of heavy shadows for panels and cards.
- 8px controls and 12px panels/cards.
- Inter/system UI for controls, with no oversized marketing typography.

## Layout

Keep the existing three-zone editor architecture:

1. Top navigation.
2. Left tool and resource panel.
3. Center canvas workspace.
4. Right layer settings panel.

The desktop layout remains a three-column workbench. The left side uses a compact vertical tool rail plus the active resource panel. The center canvas remains the primary focal area. The right settings panel stays visible for the selected layer.

On `max-xl` viewports, preserve the existing stacked behavior so the tool panel, canvas, and settings remain usable without introducing new navigation state.

## Top Navigation

The top bar becomes a quiet product bar:

- White or cream-tinted surface with a thin bottom border.
- Left: editor title and active channel dimensions.
- Center: platform segmented control using white/cream inactive states and an ink or orange active state.
- Right: secondary link back to the Markdown tool and a primary orange PNG export button with the existing download icon.

## Left Tool Panel

The left panel should read as a resource library:

- Tool rail is narrower and icon-led, with compact labels.
- Active tool state uses ink/orange emphasis and subtle cream background.
- Template, background, and logo cards use white surfaces, 12px radius, thin borders, and orange selected rings.
- Search and tab controls follow the input and segmented-control styling in `DESIGN.md`.

The current tool categories remain unchanged: templates, text, image, background.

## Center Canvas Workspace

The canvas area should feel like a design work surface:

- Warm cream workspace background.
- Centered canvas with enough breathing room.
- Subtle grid or ruled workbench treatment is allowed if implemented with CSS and kept quiet.
- Canvas shadow is refined and less heavy than the current large blue-gray shadow.
- Save-template and copy-template actions become a compact floating toolbar near the top right of the canvas workspace.

The rendered cover canvas content, layer positioning, editing behavior, snapping guides, and export node remain unchanged.

## Right Settings Panel

The settings panel should become easier to scan:

- White panel with thin left border.
- Small section labels for typography, alignment, spacing, color, and effects.
- Inputs and selects use cream/white surfaces, 8px radius, and orange focus rings.
- Empty state uses a cream-tinted panel instead of gray.
- Existing controls and behavior stay intact.

## Pickers and Dialog

Text highlight and text effect popovers should match the new workbench chrome:

- 12px to 16px radius, not oversized pill-like 28px radius.
- White panel, thin border, subtle shadow.
- Orange selected rings and cream hover/active surfaces.

The save-template dialog should also follow the same visual system: cream overlay accents, white modal surface, thin borders, and orange primary confirmation.

## Testing

Run the narrowest meaningful verification after implementation:

- Cover component tests: `npx vitest run src/cover/components/CoverEditor.test.tsx src/cover/components/CoverPreviewPanel.test.tsx src/cover/components/CoverEditor.customTemplates.test.tsx`
- Add or update tests only if markup, labels, behavior, or tested class expectations change.
- Run `npm run build` only if route wiring, app config, exports, or production compilation-sensitive code changes.

## Out Of Scope

- No changes to cover template data or exported cover aesthetics.
- No new editor features.
- No image upload or asset-library expansion.
- No shared export refactor.
- No redesign of the Markdown image workspace.
