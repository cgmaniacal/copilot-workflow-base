<!-- Optional: Only generated when a frontend (UI) layer is detected during onboarding -->

# Frontend Quality Standards

<!-- ONBOARDING: This doc captures quality requirements for user-facing UI.
     These standards apply during both Implement and Validate phases.
     Discover the UI framework in use and adapt framework-specific sections accordingly. -->

Read this before building any user-facing feature.

## Accessibility (WCAG 2.1 AA)

Every component must meet [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) compliance.

### HTML Semantics

- Use semantic elements: `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`
- Headings follow hierarchy (`h1` → `h2` → `h3`) — never skip levels
- Use `<button>` for actions, `<a>` for navigation — never a `<div>` with a click handler
- Lists use `<ul>`/`<ol>`, tables use `<table>` with `<th scope>`

### Keyboard Navigation

- All interactive elements reachable via Tab
- Visible focus indicators on every focusable element (never remove outline without a replacement)
- Modal and dropdown overlays trap focus while open and return focus on close
- Custom widgets follow [ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/) keyboard patterns

### Screen Readers

- Images: `alt` text on all `<img>` (decorative images use `alt=""`)
- Forms: every input has an associated label (or `aria-label`/`aria-labelledby`)
- Dynamic content: use `aria-live` regions for updates that should be announced
- Icons: icon-only buttons must have `aria-label`

### Color and Contrast

- Text contrast ratio: minimum 4.5:1 (normal text), 3:1 (large text)
- Never rely on color alone to convey meaning — use text, icons, or patterns alongside

### Testing

- Tab through every page to verify keyboard flow
- Test with a screen reader for major features
- Run an automated accessibility audit (e.g., axe-core, Lighthouse) during Validate phase

## Responsive Design

All layouts must work across mobile (320px), tablet (768px), and desktop (1024px+).

### Approach

- Mobile-first: write base styles for small screens, add breakpoints for larger screens
- Prefer flexible layout primitives (flex, grid) over fixed widths
- Use relative units for layout dimensions

### Touch Targets

- Minimum tap target size: 44x44px (WCAG 2.5.5)
- Adequate spacing between interactive elements on mobile

### Testing

- Resize browser from 320px to 1920px — no horizontal scroll, no overlapping content
- Test on actual mobile devices or a device emulator

## Performance

<!-- ONBOARDING: Document the performance targets for this project.
     Check for Lighthouse CI config, performance budgets, or explicit targets in README.
     Adapt the sections below to the UI framework and bundler in use. -->

Target: Lighthouse scores of 90+ across all categories.

### Images

- Use responsive images with appropriate size variants
- Serve modern formats where supported, with fallbacks
- Lazy-load below-the-fold images
- Set explicit dimensions to prevent layout shift

### Code Splitting

<!-- ONBOARDING: Document the code splitting approach used in this project.
     Look for dynamic imports, route-based splitting, or lazy component loading. -->

{{TODO: detected during onboarding}}

### Core Web Vitals

| Metric | Target | What it measures |
|--------|--------|-----------------|
| LCP (Largest Contentful Paint) | < 2.5s | How fast the main content loads |
| INP (Interaction to Next Paint) | < 200ms | How fast the page responds to input |
| CLS (Cumulative Layout Shift) | < 0.1 | How much the layout shifts during load |

## SEO (When Applicable)

Apply when the project is a public-facing website (marketing site, blog, docs, etc.). Skip for internal apps and dashboards behind authentication.

### Fundamentals

- Every page has a unique `<title>` and `<meta name="description">`
- Use semantic HTML (good semantics help both accessibility and SEO)
- One `<h1>` per page reflecting the page's primary topic
- Clean URL structure

### Meta Tags

```html
<head>
  <title>Page Title — Site Name</title>
  <meta name="description" content="Concise description under 160 chars">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="/path/to/share-image.jpg">
</head>
```

## Validate Phase Checklist

- [ ] Keyboard-navigable: all interactive elements reachable via Tab
- [ ] Screen reader: labels on inputs, alt on images, semantic HTML
- [ ] Color contrast: 4.5:1 for normal text, 3:1 for large text
- [ ] Responsive: no issues at 320px, 768px, 1024px
- [ ] Lighthouse: 90+ on Performance, Accessibility, Best Practices
- [ ] Images: responsive, lazy-loaded, explicit dimensions
- [ ] SEO (if public site): unique titles, meta descriptions, semantic headings
