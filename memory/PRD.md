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

## Products (6 total)
1. GRC Nexus (v3.0) - 50+ frameworks, risk/audit mgmt, STRIDE
2. Beskar OSINT Toolkit - 15+ threat intel sources
3. LiteSabre Scanner (v3.0) - 176+ rules, 250+ payloads, CI/CD
4. LiteSabre Pro (NEW) - AI Pentest Agent, DAST, Frida analysis
5. Amidala CSPM (v3.0) - 185 checks, evidence collection
6. DPDPA Consent Manager (NEW) - India DPDPA 2023, PII scanner

## Backlog
- P2: Mobile responsiveness deep testing
- P2: Product detail modal verification for all 6 products
- P3: Case studies or testimonials section
- P3: Team/about section
