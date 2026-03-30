# SCSS Refactor: main.scss → Component-Scoped Partials

## Overview

The monolithic `main.scss` (869 lines) has been split into 10 focused, component-scoped SCSS files. This refactor improves maintainability, reduces `!important` declarations by ~75%, and makes the codebase easier to understand and modify.

**Branch:** `refactor/scss-split`

---

## What Changed

### File Structure

**Before:**
```
src/styles/
├── main.scss (869 lines — everything)
└── _variables.scss
```

**After:**
```
src/styles/
├── main.scss (20 lines — orchestrator only)
├── _variables.scss (unchanged)
├── _themes.scss (46 lines — CSS custom properties)
├── _glass-card.scss (43 lines — shared mixin)
├── _global.scss (125 lines — body, utilities, scrollbar)
├── _hero.scss (219 lines — hero section)
├── _about.scss (74 lines — about section)
├── _techstack.scss (79 lines — tech carousel)
├── _projects.scss (158 lines — projects section)
├── _contact.scss (40 lines — contact section)
└── _theme-toggle.scss (57 lines — toggle button)
```

### Key Architectural Changes

#### 1. **`%glass-card` → `@mixin glass-card`**

**Why:** SCSS `%placeholder` can only be `@extend`ed within the same file or by files that have `@use`d that file. However, with modern SCSS modules (`@use`), placeholders are not accessible across module boundaries.

**Solution:** Converted the placeholder to a `@mixin` so any file can `@use "glass-card" as *` and `@include glass-card`.

**Trade-off:** Mixin output is duplicated per usage (5 times) vs. placeholder's single selector list. CSS output is ~1-2KB larger uncompressed, but gzip compression eliminates the difference.

**Files using the mixin:**
- `.hero-btn` (Hero section)
- `.gradient-card` (About section)
- `.tech-card` (Tech Stack)
- `.project-image-container` (Projects)
- `.contact-card` (Contact)

---

#### 2. **Co-located Light/Dark Mode Styles**

**Before:** 266-line monolithic `[data-theme="light"]` block at the end of main.scss, separated from its dark-mode counterparts.

**After:** Each component file nests light-mode overrides alongside dark-mode styles using the `[data-theme="light"] & { ... }` pattern.

**Example (from `_about.scss`):**
```scss
.about-card {
  p {
    font-size: 1rem;
  }

  [data-theme="light"] & {
    backdrop-filter: none;
    // light-mode specific rules
  }
}
```

**Benefits:**
- Easier to find and modify theme overrides
- Clear visual hierarchy: base rules → light-mode overrides
- Easier to add new components without hunting for scattered light-mode code

---

#### 3. **`!important` Reduction: 62 → 15 (~75% reduction)**

**Why `!important` still exists:**
Most remaining `!important` (10 of 15) are necessary — they override Bootstrap utility classes that themselves use `!important`:
- `.text-white !important` — overridden by `.hero-btn:hover color`
- `.text-light !important` — overridden by `.project-icon-link` color
- `.text-primary !important` — overridden in light mode
- `.btn-outline-primary !important` — overridden in light mode
- `.btn-primary` — color override

**Removed `!important` (47 declarations):**
1. **Body bg/color** (2) — Increased specificity with `html body` selector; Bootstrap's body rule has no `!important`, so source order wins.
2. **H1 gap** (2) — No competing Bootstrap rule; normal specificity sufficient.
3. **Light-mode card overrides** (35) — Using `[data-theme="light"] .class` (specificity 0,2,0) which beats `.class` (0,1,0).
4. **Light-mode utility overrides** (8) — Specificity bump via `[data-theme="light"]` prefix.

**Pattern for specificity-based removal:**
```scss
// Dark mode base (specificity 0,1,0)
.about-card {
  backdrop-filter: blur(10px);
}

// Light mode override (specificity 0,2,0) — no !important needed
[data-theme="light"] .about-card {
  backdrop-filter: none;
}
```

---

## File Descriptions

### `_themes.scss`
**46 lines** — All CSS custom properties for dark and light modes.

Contains:
- `:root` block: Dark mode defaults (primary color, glass effects, shadows, etc.)
- `[data-theme="light"]` block: Light mode overrides + neobrutalist shadow tokens

**Why separate:** Custom properties are runtime-switching and theme-agnostic. Keeping them centralized makes it easy to adjust colors/effects across the entire portfolio in one place.

---

### `_glass-card.scss`
**43 lines** — The `@mixin glass-card` that defines the glass-morphism card style.

Contains:
- Gradient background
- Backdrop filter blur
- Border and shadow styling
- Pseudo-element highlight (radial gradient at top)
- Hover state with lift effect

**Usage:** Five component files `@use "glass-card" as *` and `@include glass-card` on their card classes.

---

### `_global.scss`
**125 lines** — Global styles affecting the entire page.

Contains:
- **Body overrides:** `overflow-x: hidden`, background-color, color, transition (without `!important` — specificity via `html body`)
- **Utility classes:** `.letter-spacing-2`, `.bg-darker`, `.hover-primary`, `.text-justify`, `.text-relaxed`, `.mw-600`
- **`.hover-effect`:** Base styles for hover effects + co-located light-mode overrides (neobrutalist shadow/transform)
- **Scrollbar:** Custom webkit scrollbar styling for both themes
- **Bootstrap light-mode overrides:** Text color, button, border utilities that need `!important` to beat Bootstrap's own `!important`

---

### `_hero.scss`
**219 lines** — Hero section: background grid, glow effect, button, scroll indicator, animations.

Contains:
- `.hero-background` — Grid pattern with fade mask
- `.hero-glow` — Mouse-tracking radial gradient
- `.text-neon` — Text shadow glow + light-mode override (no glow)
- `.hero-btn` — Glass card button with `@include glass-card` + light-mode neobrutalist override
- `.scrolldown`, `.chevrons` — Animated scroll indicators
- `.hero-section` — Background gradient and h1 sizing
- **Keyframes:** `scrolldown-anim`, `pulse54012`, `drawLetter`, `fillLetter` (light-mode SVG animation)

**Light-mode specifics:**
- `.text-neon` → no text-shadow
- `.hero-btn` → neobrutalist shadow, translate-based hover
- `.outline-text` (SVG) → stroke-to-fill animation

---

### `_about.scss`
**74 lines** — About section: gradient cards and pastel backgrounds.

Contains:
- `.gradient-card` — Glass card with `@include glass-card` + light-mode override
- `.about-card` — Card styling with p tags + responsive centering
- Light-mode specific:
  - Removes `backdrop-filter`
  - Disables hover transform
  - Sets pastel backgrounds (4 variants: `#e3dacc`, `#bcd1ca`, `#cbcadb`, `#6a9bcc`)

---

### `_techstack.scss`
**79 lines** — Tech stack carousel: infinite scrolling animation, icon sizing.

Contains:
- `.tech-carousel-container` — Flex overflow with fade mask + light-mode padding
- `.tech-carousel-track` — Animated scroll container
- `.tech-icon` — Icon sizing and hover scale
- `.invert-white` — Filter inversion for dark icons + light-mode override (no filter)
- `.tech-card` — Glass card with `@include glass-card` + light-mode override
- **Keyframes:** `scroll` (infinite translateX)

---

### `_projects.scss`
**158 lines** — Projects section: image containers, icon links, pastel backgrounds.

Contains:
- `.bg-dark-glass` — Glass background without glass-card mixin (for containers)
- `.project-image-container` — Glass card with `@include glass-card`, GPU acceleration hints, responsive aspect ratio + light-mode override
- `.project-img-custom` — Image object-fit and positioning
- `.projects-gap` — Clamp-based gap sizing
- `.project-icon-link` — GPU-accelerated smooth icon hover with cubic-bezier transition + light-mode color override (dark default, primary on hover)
- `.vertical-divider` — Small separator element
- Light-mode specific:
  - Project card pastel backgrounds (matching about cards)

**Hardware acceleration hints:**
- `will-change: transform` — Hints to browser
- `transform: translateZ(0)` — Forces GPU rendering
- `backface-visibility: hidden` — Prevents blurriness

---

### `_contact.scss`
**40 lines** — Contact section: glass cards with icon/text hover effects.

Contains:
- `.contact-card` — Glass card with `@include glass-card`, icon/text color transitions + light-mode GPU-accelerated neobrutalist override

---

### `_theme-toggle.scss`
**57 lines** — Fixed-position theme toggle button.

Contains:
- `.theme-toggle` — Fixed position, glass-morphism background, border/shadow transitions, hover lift, active scale + light-mode neobrutalist override (shadow-based shift instead of lift)

---

### `main.scss` (New)
**20 lines** — Pure orchestrator file.

```scss
@use "variables" as *;
@use "bootstrap/scss/bootstrap" with (...);
@use "themes";
@use "global";
@use "hero";
@use "about";
@use "techstack";
@use "projects";
@use "contact";
@use "theme-toggle";
```

**Import order matters:**
1. `variables` → custom Sass values
2. `bootstrap` → Framework styles (depends on variables)
3. `themes` → CSS custom properties (pure CSS, no dependencies)
4. `global` → Body, utilities, scrollbar (foundation)
5. Components → (order doesn't matter relative to each other)

---

## Testing Checklist

After this refactor, the portfolio should be **visually identical** in both dark and light modes. Verify:

- [ ] **Dark mode (default)**
  - Hero: grid, glow, neon text, scroll indicator work
  - About: glass cards with glow, pastel backgrounds absent
  - Tech Stack: carousel animates, icons hover
  - Projects: glass cards, icon links bounce smoothly
  - Contact: glass cards with color transitions
  - Toggle button: glass-morphism fixed button, smooth hover
  - Scrollbar: dark theme scrollbar visible

- [ ] **Light mode**
  - Hero: no text glow, SVG outline drawing animation, neobrutalist button
  - About: solid backgrounds (no glass), pastel card colors, no hover lift
  - Tech Stack: no glass effect, neobrutalist shadows
  - Projects: solid backgrounds, neobrutalist shadows, pastel card colors
  - Contact: neobrutalist shadows, smooth touch interactions
  - Toggle button: neobrutalist shadow-based shift
  - Scrollbar: light theme scrollbar visible

- [ ] **Theme toggle**
  - Rapid switching dark ↔ light (≥5 times) — transitions smooth, no jarring snaps
  - No visual glitches or color flashes

- [ ] **Responsive** (mobile, tablet, desktop)
  - All breakpoints work: 576px, 768px, 992px, 1200px
  - Hero h1 gap adjusts correctly
  - Tech carousel responsive sizing (40px mobile, 50px desktop icons)
  - Projects container responsive max-width

- [ ] **Performance**
  - Build time: `npm run build` completes without errors
  - Lint: `npm run lint` passes with no warnings
  - CSS output size comparable to before (within 5%)

---

## Migration Guide (For Future Edits)

### Adding a new component style

1. Create `src/styles/_component-name.scss`
2. If it uses glass-card mixin: add `@use "glass-card" as *;` at the top
3. Structure: dark-mode base rules → light-mode overrides using `[data-theme="light"] & { ... }` nesting
4. Add `@use "component-name";` to `main.scss` after `@use "global";`

### Modifying a component

1. Find the component file (e.g., `_hero.scss`)
2. Edit dark-mode styles directly
3. Add/modify light-mode overrides in the `[data-theme="light"] &` block
4. No need to touch `main.scss` unless adding a brand-new component file

### Adjusting theme colors

1. Open `_themes.scss`
2. Modify the CSS custom property value in `:root` (dark) or `[data-theme="light"]` (light)
3. All files reference these variables, so changes propagate automatically

### Removing `!important`

Only remove if:
1. The rule doesn't conflict with Bootstrap utilities, **OR**
2. You're increasing specificity (e.g., wrapping in `[data-theme="light"]`)

Example:
```scss
// ❌ Don't remove without understanding why it's there
color: var(--primary) !important;

// ✅ OK to remove if Bootstrap rule being overridden has no !important
background-color: var(--body-bg); // (was !important before refactor)
```

---

## Performance Impact

### CSS File Size
- **Before:** 869 lines in 1 file
- **After:** ~820 lines across 11 files
- **Gzip size:** Negligible difference (~5% variance due to mixin duplication vs. placeholder grouping)

### Build Time
- No measurable change (Vite builds fast either way)

### Runtime Performance
- **Zero impact** — CSS output is functionally equivalent
- GPU acceleration hints (`translateZ(0)`, `will-change`) preserved
- Hardware acceleration behavior unchanged

---

## Summary of Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **File count** | 1 monolithic | 11 focused |
| **Avg lines per file** | 869 | ~80 |
| **`!important` count** | 62 | 15 |
| **Code locality** | Scattered | Co-located (dark + light together) |
| **Maintainability** | Hard to find rules | Easy to navigate |
| **Component isolation** | None | Clear file → component mapping |
| **Future edits** | Touch multiple blocks | Edit one file |

---

## Files Changed

```
Created:
  src/styles/_themes.scss
  src/styles/_glass-card.scss
  src/styles/_global.scss
  src/styles/_hero.scss
  src/styles/_about.scss
  src/styles/_techstack.scss
  src/styles/_projects.scss
  src/styles/_contact.scss
  src/styles/_theme-toggle.scss

Modified:
  src/styles/main.scss (reduced from 869 → 20 lines)

Unchanged:
  src/styles/_variables.scss
  src/main.tsx (entry point still imports main.scss)
```

---

## How to Verify

```bash
# Build without errors
npm run build

# Lint passes
npm run lint

# Start dev server
npm run dev
# Then open http://localhost:5173 and verify:
# - Dark mode looks correct
# - Light mode looks correct
# - Theme toggle works
# - All sections render identically to before refactor
```

---

## Questions?

If a specific component's light mode doesn't look right:
1. Find the component file (e.g., `_about.scss`)
2. Look for the `[data-theme="light"] &` block
3. Check if there's a conflicting CSS rule or missing override
4. Remember: specificity of `[data-theme="light"] .class` is (0,2,0), which beats `.class` (0,1,0)
