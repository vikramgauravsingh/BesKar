# Beskar IT Website - Product Requirements Document

## Original Problem Statement
Update website with products listed in GitHub repository (Nexus and OSINT). All messages and notifications to support@beskarit.com.

## User Choices & Inputs
- Create new product listing page and update products
- Both overview cards + detailed pages, hide pricing
- Update all contact/notification emails to support@beskarit.com
- Keep existing design
- Add additional services: auditing, compliance frameworks (ISO27001, ISO42001, SOC2, SOC3, PCI, HIPAA, GDPR, SAMA, CCPA, DPDPA, USPCF), VAPT, secure code reviews, CSPM

## Architecture & Tech Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Hosting**: Kubernetes container

## User Personas
1. **Security Officers** - Looking for GRC and compliance solutions
2. **Threat Hunters** - Need OSINT and threat intelligence tools
3. **DevSecOps Teams** - Require vulnerability scanning and code review
4. **CISOs/Executives** - Need dashboards and audit preparation support

## Core Requirements (Static)
- Product showcase with detailed feature pages
- Services section highlighting consulting capabilities
- Compliance frameworks coverage display
- Contact form with email to support@beskarit.com
- Privacy Policy and Terms of Service pages

## What's Been Implemented

### Jan 2026 - Initial Update
- ✅ **Products Section**: GRC Nexus, Beskar OSINT Toolkit, LiteSabre Scanner, Amidala CSPM
- ✅ **Product Detail Modals**: Clickable cards with full feature descriptions
- ✅ **Services Section**: Security Auditing, VAPT, Secure Code Review, CSPM, Framework Implementation, Managed Security
- ✅ **Compliance Frameworks Section**: 
  - Information Security (ISO 27001/27002/27017/27018/27701)
  - AI & Technology (ISO 42001, NIST AI RMF, EU AI Act)
  - Unified Framework (USPCF - 63 controls across 11 domains)
  - Privacy (GDPR, CCPA, DPDPA, LGPD, POPIA)
  - Healthcare (HIPAA, HITRUST, HITECH)
  - Financial (PCI DSS, SOX, GLBA, FFIEC)
  - SOC Reports (SOC 1, 2, 3)
  - Regional (SAMA, NESA, PDPL, CBK)
  - Government (NIST 800-53, FedRAMP, CMMC, CIS)
- ✅ **Contact Integration**: All forms/emails updated to support@beskarit.com
- ✅ **Privacy Policy Page**: Full policy from beskarit.com
- ✅ **Terms of Service Page**: Full terms from beskarit.com
- ✅ **Backend API**: Contact form, health check, support email endpoint

## P0/P1/P2 Features Remaining

### P0 (Critical) - DONE
- ✅ Product display with detailed modals
- ✅ Contact form working
- ✅ All emails to support@beskarit.com

### P1 (Important)
- Individual product demo request flow
- Email notification integration for contact form submissions
- USPCF detailed control browser/viewer

### P2 (Nice to Have)
- Blog/resources section
- Live chat widget
- Calendly scheduling integration
- Case studies/testimonials section

## Next Tasks
1. Add email notification service for contact form (SendGrid/Resend)
2. Create individual product landing pages with demo booking
3. Add blog/resources section for thought leadership
4. Implement analytics tracking

## Testing Status
- Backend: 100% pass rate
- Frontend: 100% pass rate
- All bugs fixed from iteration 2 and 3
