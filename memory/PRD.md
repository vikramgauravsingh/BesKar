# Beskar IT Website - PRD

## Original Problem Statement
Update website with new features and offerings from GitHub README (Nexus-and-OSINT). No pricing or secrets to be published. Keep same dark theme. Merge What's New features into product cards. Full mobile responsiveness audit.

## Architecture
- **Frontend**: React 18 with Framer Motion, Tailwind CSS, Lucide React icons
- **Backend**: FastAPI with MongoDB, Brevo email integration
- **Styling**: Custom dark theme (Beskar aesthetic) with glass-morphism

## What's Been Implemented

### Iteration 1 - Website Content Update (Jan 2026)
- Added 2 new products: LiteSabre Pro (AI Pentesting), DPDPA Consent Manager
- Updated 3 existing products: GRC Nexus (50+ frameworks), LiteSabre (176+ rules), Amidala (185 checks)
- Added 3 new sections: Platform at a Glance, Why Beskar, AI Roadmap
- Added 2 new services: AI Pentesting, Security Training
- Updated hero, stats, nav, footer

### Iteration 2 - Feature Merge & Mobile Audit (Jan 2026)
- Merged What's New v3.0 features into product cards with badges (v3.0/NEW)
- Removed standalone AI-Enhanced Roadmap section per user request
- Full mobile responsiveness: WhyBeskar stacked before/after, PlatformGlance responsive grid
- Fixed impact stats (50+, 176+, 185, 250+)
- Fixed LiteSabre badge, removed duplicate code at end of App.js

### Iteration 3 - DPDPA Cookie Consent Banner (Jan 2026)
- Added `BeskarConsentBanner` component at `/app/frontend/src/components/BeskarConsentBanner.js`
- Mounted globally in `App.js` (renders on every page)
- Posts impressions + consents to `https://portal.beskarit.com/api/dpdpa/public`
- Persists consent in localStorage under `beskar_consent_<BANNER_ID>` (version-gated)
- Supports Accept All / Reject All / Manage Preferences (Essential + Session mandatory, Marketing optional)
- Fixed JSX syntax from original snippet (single → double braces for style objects) and contrast on "Accept All" button

### Iteration 4 - Consent Reopen + User-ID Bridge (Jan 2026)
- Added "Cookie Preferences" link in footer (`footer-cookie-preferences-link`) that dispatches a `beskar:open-consent` event the banner listens for; banner reopens with previously saved selections preloaded
- `BeskarConsentBanner` now resolves `userId` from: prop → `window.__beskarUserId` (auth-context bridge) → anonymous cookie ID — ready for future login integration without further changes

## Products (6 total)
1. GRC Nexus (v3.0) - 50+ frameworks, risk/audit mgmt, STRIDE
2. Beskar OSINT Toolkit - 15+ threat intel sources
3. LiteSabre Scanner (v3.0) - 176+ rules, 250+ payloads, CI/CD
4. LiteSabre Pro (NEW) - AI Pentest Agent, DAST, Frida analysis
5. Amidala CSPM (v3.0) - 185 checks, evidence collection
6. DPDPA Consent Manager (NEW) - India DPDPA 2023, PII scanner

### Iteration 5 - SEO Alt Text + Font Size Bump (Jan 2026)
- Updated all `<img>` alt text across the site to be descriptive + SEO keyword-balanced:
  - Header & footer logo alt now includes "Unified GRC, Threat Intelligence, Vulnerability Scanning & Cloud Security Platform"
  - Product card images use `${name} — ${tagline} | Beskar IT cybersecurity platform module`
  - Added `loading="lazy"/"eager"` and explicit `width`/`height` on logos for CLS/perf
- Rewrote `/app/frontend/public/index.html` with full SEO meta tags:
  - SEO-optimized `<title>`, `meta description`, `meta keywords`, `robots`, `canonical`
  - Open Graph + Twitter Card tags
  - JSON-LD `Organization` structured data
- Global font-size bump: `html { font-size: 17px }` (~6% slight bump) + `body { line-height: 1.6 }` — all rem-based sizes scale uniformly

### Iteration 6 - sitemap.xml + robots.txt + Per-Route SEO (Jan 2026)
- Added `/app/frontend/public/robots.txt` (allow all, disallow `/api/`, links sitemap)
- Added `/app/frontend/public/sitemap.xml` with home, anchor sections, /privacy, /terms + image sitemap entry for logo
- Installed `react-helmet-async` and created `/app/frontend/src/components/SEO.js` reusable component
- Wrapped `<App />` in `<HelmetProvider>` and added per-route `<SEO>` tags:
  - Home: full keyword-rich title, description, canonical, og:url
  - Privacy (`/privacy`): GDPR/DPDPA-focused meta
  - Terms (`/terms`): service-terms-focused meta
- Cleaned `public/index.html` so Helmet fully owns per-route overridable tags (title, description, og:url, og:title, og:description, twitter:url/title/description, canonical) — eliminates duplicate meta tags. Static tags (og:type/image/site_name/locale, twitter:card/image, JSON-LD Organization) kept in index.html as crawler fallback.

### Iteration 7 - JSON-LD SoftwareApplication for All 6 Products (Jan 2026)
- Added `/app/frontend/src/seo/productsSchema.js` exporting an `@graph` containing:
  - `ItemList` of all 6 products with stable `@id` anchors (`#grc-nexus`, `#beskar-osint`, etc.)
  - 6 `SoftwareApplication` nodes (GRC Nexus, Beskar OSINT Toolkit, LiteSabre Scanner, Amidala CSPM, LiteSabre Pro, DPDPA Consent Manager) each with `name`, `alternateName`, `description`, `image`, `applicationCategory`, `applicationSubCategory`, `operatingSystem`, `keywords`, `softwareVersion` (where applicable), `featureList`, `publisher` (Beskar IT Organization), and `offers` (contact-for-pricing)
- Extended `SEO.js` to accept a `jsonLd` prop and inject via Helmet `<script type="application/ld+json">`
- Home route now emits the products graph; privacy/terms routes correctly omit it (route-scoped)

## Backlog
- P2: Mobile responsiveness deep testing
- P2: Product detail modal verification for all 6 products
- P3: Case studies or testimonials section
- P3: Team/about section
- P3: Add `sitemap.xml` and `robots.txt` for full SEO coverage

## Update (Jun 2026) - Legal links
- Footer Privacy Policy -> https://www.beskarit.com/Privacy-Policy, Terms of Use -> https://www.beskarit.com/Terms-Of-Use (new tab)
- Removed built-in PrivacyPolicyPage/TermsOfServicePage + sitemap entries
- Consent banner now links to Privacy Policy
- Footer already has support@beskarit.com email + LinkedIn links
- Consent banner also links Terms of Use
