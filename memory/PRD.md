# Beskar IT Website - PRD

## Original Problem Statement
Update contact form to use Brevo API with new credentials:
- Brevo API Key: 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
- SMTP Server: smtp-relay.brevo.com:587
- Login: a151d5001@smtp-brevo.com
- Send submissions to: support@beskarIT.com

## Architecture
- **Frontend**: React.js with Framer Motion, TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Email Service**: Brevo (Sendinblue) Transactional Email API

## Core Requirements
1. Contact form submission functionality
2. Email notifications sent via Brevo API
3. Submissions stored in MongoDB
4. Support email: support@beskarIT.com

## What's Been Implemented
### Jan 2026
- ✅ Updated Brevo API key in backend/.env
- ✅ Configured SENDER_EMAIL to a151d5001@smtp-brevo.com
- ✅ Configured SUPPORT_EMAIL to support@beskarIT.com
- ✅ Email notifications working via Brevo Transactional Email API
- ✅ All tests passed (Backend: 100%, Frontend: 100%)

## User Personas
- **Website Visitors**: Submit inquiries via contact form
- **Support Team**: Receive email notifications at support@beskarIT.com

## Current Status
- Contact form fully functional
- Emails successfully delivered via Brevo API
- Frontend contact form integrated with backend

## Backlog
- P2: Add email templates customization
- P2: Add email delivery tracking/analytics
