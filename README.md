# Style Vault

**100 interactive website design recipes.** A static HTML, CSS and JavaScript gallery with no framework or build step.

## Run it

Open `index.html` in a browser. For full clipboard support, serve it locally:

```bash
cd style-vault
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## What's included

- `index.html`: gallery interface and editable demonstration site
- `styles.css`: complete UI, responsive layout variants, and CSS animations
- `presets.js`: all 100 design recipes, including color tokens, layout, typography, and motion
- `app.js`: live switching, searching, filters, favorites, randomized selection, export, and clipboard
- `LICENSE`: MIT license for redistribution and remixing

## Using the styles in a coding agent

1. Select a style in the gallery.
2. Click **Copy coding agent prompt**.
3. Paste the prompt into your coding agent alongside your own site requirements.
4. Optionally select **Copy CSS tokens** or **Download recipe** for a machine-readable JSON file.

Each recipe includes a palette, font, card/surface treatment, motion style, and page composition. The live preview is a flexible generic demonstration. Prompts are meant to guide the agent to recreate the aesthetic for your actual content, not duplicate the gallery itself.

## How the 100 styles work

20 independent visual art directions × 5 layout compositions = 100 presets. Each visual direction defines an accent palette, background, typography, surface style, and animation language. The five compositions reshape the preview hero and features. Some variants deliberately share a palette while expressing different page structures.

## Edit or expand

Modify the recipes in `presets.js`. Every recipe must have a unique three-digit `id`. You can extend the `data-layout`, `data-surface` and `data-motion` selectors in `styles.css` with additional styles. The count assertion in `app.js` currently expects 100 presets. If adding or removing recipes, update that count and the static text in `index.html`.

## Accessibility and caveats

- All gallery navigation works by keyboard. Search shortcut: `/`. `Escape` closes the mobile sidebar.
- Animation respects the system's `prefers-reduced-motion` setting.
- Favorite presets are stored in the browser's local storage. No user accounts or server storage.
- Fonts load from Google Fonts if online. System fonts provide a fallback when offline.
- This is a curated style explorer, not a generator of 100 separate production website implementations. The copyable agent prompts are the intended distribution assets.
