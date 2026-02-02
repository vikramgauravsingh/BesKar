# Beskar IT Website - PRD

## Original Problem Statement
1. Add LinkedIn button with URL: https://www.linkedin.com/company/beskar-it
2. Update contact form email sending API with Brevo key, send responses to support@beskarit.com

## What's Been Implemented
- **2026-02-02**: Updated LinkedIn button URL in footer
- **2026-02-02**: Migrated email service from Resend to Brevo (Sendinblue) for contact form notifications

## Architecture
- **Frontend**: React.js with Tailwind CSS, Framer Motion animations
- **Backend**: FastAPI with MongoDB, Brevo for transactional emails
- **Features**: Landing page, contact form with email notifications, compliance frameworks display

## Core Features
- Hero section with company tagline
- Products section (GRC Nexus, OSINT Toolkit, LiteSabre Scanner, Amidala CSPM)
- Services section
- Compliance frameworks showcase
- Contact form sends notifications to support@beskarit.com via Brevo
- Footer with email and LinkedIn social links

## Email Configuration
- Provider: Brevo (Sendinblue)
- Recipient: support@beskarit.com
- Sender: notifications@beskarit.com

## Backlog
- None

## Next Tasks
- None
