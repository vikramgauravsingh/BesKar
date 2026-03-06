# Beskar IT Website - PRD

## Original Problem Statement
Create a popup for preview of app www.portal.beskarit.com, add button to access portal.

## User Choices
1. Promotional card with key features in popup
2. Popup opens automatically on page load
3. Design style based on best practices
4. Existing app enhancement

## Architecture
- **Frontend**: React with Framer Motion, Tailwind CSS
- **Backend**: FastAPI with MongoDB
- **Styling**: Custom CSS with glass-morphism effects

## User Personas
- **Site Visitors**: Potential customers viewing Beskar IT website
- **Portal Users**: Existing customers redirecting to the security platform

## Core Requirements
- [x] Auto-opening popup on page load (1.5s delay)
- [x] Promotional card showing 4 key portal features
- [x] "Access Portal" button linking to https://www.portal.beskarit.com
- [x] Dismiss functionality (X button, "Continue to Website", click outside)
- [x] Session-based memory (popup shows once per session)

## What's Been Implemented
**Date: Jan 2026**
- Created `PortalPreviewPopup` component with:
  - Shield icon header with "Beskar Security Portal" title
  - 4 feature cards: GRC Dashboard, OSINT Toolkit, Vulnerability Scanner, Cloud Security
  - Animated entrance with spring animation
  - Cyan accent "Access Portal" button
  - Backdrop blur overlay
  - SessionStorage to prevent repeated displays
- Added corresponding CSS animations
- Integrated popup into main App component with auto-open logic

## Backlog
- P2: Add analytics tracking for popup interactions
- P2: A/B test popup timing (1.5s vs 2s delay)
- P3: Add exit-intent popup trigger option

## Next Tasks
- None - feature complete
