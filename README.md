# Coheus landing

Presentation-ready one-page marketing concept for **Coheus** — executive intelligence for mortgage leaders.

## Stack

- Astro (static)
- Tailwind CSS v4
- GSAP (subtle scroll/entrance motion only)

## Develop

```sh
npm install
npm run dev
```

Open `http://localhost:4321/cohi-landing/`

## Deploy (GitHub Pages)

Pushes to `master` build and deploy via `.github/workflows/deploy.yml`.

1. In the repo: **Settings → Pages → Source → GitHub Actions**
2. After the first successful run, the site is at:
   `https://smartstartv2.github.io/cohi-landing/`

## Notes

- Single landing page only — nav items are visual anchors, not separate routes.
- CTAs point to on-page sections (`#demo`, `#how-it-works`, `#contact`).
- No fake logos, testimonials, or unsupported metrics.
