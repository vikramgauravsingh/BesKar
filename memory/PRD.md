# Beskar IT Website - PRD

## Original Problem Statement
"Unable to send message. Please email us directly at support@beskarit.com" error at https://www.beskarit.com/
User wants to fix the contact form using Brevo (formerly Sendinblue) for email notifications.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion (port 3000)
- **Backend**: FastAPI + Python (port 8001)
- **Database**: MongoDB (beskarit DB, contacts collection)
- **Email**: Brevo (sib-api-v3-sdk) for transactional email notifications

## User Personas
- Website visitors submitting contact inquiries
- Beskar IT support team receiving email notifications

## Core Requirements (Static)
- Contact form saves submissions to MongoDB
- Email notification sent to support@beskarit.com via Brevo
- Graceful handling when Brevo key is unavailable
- Form validation (name, email, message required)

## What's Been Implemented
### 2026-02-11 - Contact Form Bug Fix
- Fixed `send_notification_email` to catch ALL exceptions (not just `ApiException`), preventing endpoint crashes
- Fixed `.env` BREVO_API_KEY self-referencing variable interpolation (`${BREVO_API_KEY}` -> empty placeholder)
- Made email sending non-blocking in the contact endpoint (DB save and email are independent)
- Separated MongoDB error handling from email error handling in `/api/contact`
- All tests passing: Backend 7/7, Frontend 6/6

## Prioritized Backlog
### P0 (Critical)
- Production deployment: Ensure BREVO_API_KEY is properly injected as environment variable
- Verify REACT_APP_BACKEND_URL is correctly set in production build

### P1 (Important)
- Add rate limiting to contact form endpoint to prevent spam
- Add CAPTCHA/honeypot to contact form

### P2 (Nice to have)
- Auto-reply email to form submitter
- Contact form analytics dashboard
