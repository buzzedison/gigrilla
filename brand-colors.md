# Gigrilla Brand Color Guide

Primary palette (source provided):

- Purple 1 (Dark Purple): `#391D38`  (RGB 57,29,56)
- Purple 2 (Plum) – Primary: `#7A3E78`  (RGB 122,62,120)
- Purple 3 (Fuchsia Crayola): `#AD5CAA`
- Purple 4 (Orchid Crayola): `#C892C7`
- Purple 5 (Thistle): `#E4C9E3`
- Cerise (Deep Cerise): `#EC008C`
- Orange (Red Salsa): `#FF494D`
- Dark Grey (Raisin Black): `#252525`
- Medium Grey (Granite Gray): `#636363`

Decisions:
- Main brand purple: `#7A3E78` (Purple 2 / Plum)
- Accent gradients: Cerise `#EC008C` → Orange `#FF494D`
- Dark surfaces: Purple 1 `#391D38`
- Light text/accent: Purple 5 `#E4C9E3`

CSS variables (added in `app/globals.css`):

```css
:root {
  --g-purple-1: #391D38;
  --g-purple-2: #7A3E78; /* Primary */
  --g-purple-3: #AD5CAA;
  --g-purple-4: #C892C7;
  --g-purple-5: #E4C9E3;
  --g-cerise: #EC008C;
  --g-orange: #FF494D;
  --g-gray-900: #252525;
  --g-gray-500: #636363;
}
```

Usage guidance:
- Buttons primary: `background: var(--g-cerise)`; hover darken
- Hero background: `var(--g-purple-1)` with radial glows of `--g-purple-3` and `--g-cerise`
- Headlines on dark: `#fff`; body on dark: `var(--g-purple-5)`
- Borders on dark: `rgba(255,255,255,0.1)`

Gradients:
- Text gradient: `linear-gradient(90deg, var(--g-cerise), var(--g-orange))`
- Background glow: `radial-gradient(closest-side, var(--g-purple-3), transparent)` and `radial-gradient(closest-side, var(--g-cerise), transparent)`
