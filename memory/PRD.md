# Beskar IT Website - PRD

## Original Problem Statement
Contact form giving 404 error on Vercel deployment at `https://www.beskarit.com/api/contact`. The frontend works locally but the API endpoint fails in production.

## Root Cause
The `vercel.json` was configured to rewrite `/api/*` requests to an Emergent preview URL (`https://portal-preview-16.preview.emergentagent.com`) which doesn't exist in production. Vercel is a frontend-only platform and cannot run FastAPI directly.

## Solution Implemented
Converted FastAPI endpoint to Vercel Python Serverless Function.

## Architecture
- **Frontend**: React app deployed on Vercel
- **Backend API**: Vercel Python Serverless Functions (`/api/contact.py`)
- **Database**: MongoDB (connection via environment variable)
- **Email**: Brevo (Sendinblue) for notifications

## Files Changed (Feb 2026)
1. `/frontend/api/contact.py` - Created serverless function
2. `/frontend/api/requirements.txt` - Python dependencies
3. `/frontend/vercel.json` - Updated routing config

## Environment Variables Required (Vercel Dashboard)
- `MONGO_URL` - MongoDB Atlas connection string
- `DB_NAME` - Database name (beskarit)
- `BREVO_API_KEY` - Brevo API key for email
- `SUPPORT_EMAIL` - Support email address

## What's Been Implemented
- [x] Contact form submission endpoint
- [x] MongoDB storage (optional - graceful fallback)
- [x] Brevo email notifications (optional)
- [x] Input validation
- [x] CORS handling
- [x] Error handling

## Backlog / Future Improvements
- P1: Add `/api/health` endpoint for monitoring
- P1: Add rate limiting to prevent spam
- P2: Add CAPTCHA integration
- P2: Add contact form analytics

## Updates (Feb 2026 - Session 2)

### New Features Added
- [x] `/api/health` endpoint for monitoring
  - Checks MongoDB connectivity
  - Checks Brevo email configuration
  - Returns service status JSON

- [x] Rate limiting on contact form
  - 5 submissions per hour per IP/email
  - Persistent rate limiting via MongoDB
  - Falls back to in-memory if DB unavailable
  - Returns proper 429 status with Retry-After header

### Files Added/Modified
- `/frontend/api/health.py` - New health check endpoint
- `/frontend/api/contact.py` - Added rate limiting
- `/frontend/vercel.json` - Added health route

### Backlog Updated
- P2: Add CAPTCHA integration (reCAPTCHA/hCaptcha)
- P2: Add contact form analytics
- P3: Add webhook notifications (Slack/Discord)
