### Gigrilla Brand Colors

Primary purples and accents used across the product. All colors are available as CSS variables in `app/globals.css`.

#### Palette
- Purple 1 (Dark Purple) — `#391D38` — var(--g-purple-1)
- Purple 2 (Plum) — `#7A3E78` — var(--g-purple-2)
- Purple 3 (Fuchsia Crayola) — `#AD5CAA` — var(--g-purple-3)
- Purple 4 (Orchid Crayola) — `#C892C7` — var(--g-purple-4)
- Purple 5 (Thistle) — `#E4C9E3` — var(--g-purple-5)
- Cerise (Deep Cerise) — `#EC008C` — var(--g-cerise)
- Orange (Red Salsa) — `#FF494D` — var(--g-orange)
- Dark Grey (Raisin Black) — `#252525` — var(--g-gray-900)
- Medium Grey (Granite Gray) — `#636363` — var(--g-gray-600)

#### Usage Guidelines
- Brand gradient: `from-[var(--g-cerise)] to-[var(--g-orange)]`
- Surfaces and soft backgrounds: `var(--g-purple-5)` tints or a radial mix with `var(--g-purple-4)`
- Text on light: `#252525` (var(--g-gray-900))
- Text on dark: `#FFFFFF`

#### Example CSS
```css
.hero-surface {
  background:
    radial-gradient(60rem 30rem at 80% -10%, rgba(200,146,199,0.35), transparent 70%),
    radial-gradient(50rem 25rem at 0% 110%, rgba(236,0,140,0.25), transparent 70%),
    linear-gradient(180deg, #FFFFFF 0%, #F8F1F8 100%);
}

.brand-cta {
  background: var(--g-cerise);
}

.brand-cta-outline {
  border-color: var(--g-purple-4);
  color: var(--g-purple-4);
}
```

#### Main Purple Choice
- Recommend `Purple 3 (#AD5CAA)` as the primary purple for UI accents. It balances vibrancy and accessibility and pairs well with Cerise/Orange gradient.
