from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import asyncio
import logging
import resend

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Beskar IT API")

# Support email for all notifications
SUPPORT_EMAIL = "support@beskarit.com"

# Resend configuration
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend API configured successfully")
else:
    logger.warning("RESEND_API_KEY not configured - email notifications disabled")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
contacts_collection = db["contacts"]


class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: str = ""
    message: str


async def send_notification_email(form: ContactForm):
    """Send email notification to support team"""
    if not RESEND_API_KEY:
        logger.warning("Email notification skipped - RESEND_API_KEY not configured")
        return None
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0f172a; padding: 30px; border-radius: 8px;">
            <h1 style="color: #38bdf8; margin-bottom: 20px;">New Contact Form Submission</h1>
            <div style="background-color: #1e293b; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Name:</strong> {form.name}</p>
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Email:</strong> {form.email}</p>
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Company:</strong> {form.company or 'Not provided'}</p>
            </div>
            <div style="background-color: #1e293b; padding: 20px; border-radius: 4px;">
                <p style="color: #f8fafc; margin: 0 0 10px 0;"><strong>Message:</strong></p>
                <p style="color: #94a3b8; margin: 0; white-space: pre-wrap;">{form.message}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px; text-align: center;">
                This email was sent from the Beskar IT website contact form.
            </p>
        </div>
    </body>
    </html>
    """
    
    # Note: In Resend testing mode, emails can only be sent to verified email addresses
    # Once you verify a domain at resend.com/domains, change SENDER_EMAIL and SUPPORT_EMAIL
    params = {
        "from": SENDER_EMAIL,
        "to": [SUPPORT_EMAIL],
        "subject": f"New Contact: {form.name} - {form.company or 'Individual'}",
        "html": html_content,
        "reply_to": form.email
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Notification email sent successfully. ID: {email.get('id')}")
        return email.get("id")
    except Exception as e:
        error_msg = str(e)
        if "verify a domain" in error_msg.lower() or "testing emails" in error_msg.lower():
            logger.warning(f"Resend in testing mode - verify domain at resend.com/domains to send to {SUPPORT_EMAIL}")
        else:
            logger.error(f"Failed to send notification email: {error_msg}")
        return None


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "This is the way"}


@app.post("/api/contact")
async def submit_contact(form: ContactForm):
    try:
        contact_data = {
            "name": form.name,
            "email": form.email,
            "company": form.company,
            "message": form.message,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "notification_email": SUPPORT_EMAIL,
        }
        result = contacts_collection.insert_one(contact_data)
        
        # Send email notification asynchronously
        email_id = await send_notification_email(form)
        
        return {
            "success": True,
            "message": f"Thank you for reaching out. Our team at {SUPPORT_EMAIL} will be in touch soon.",
            "id": str(result.inserted_id),
            "email_sent": email_id is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/support-email")
def get_support_email():
    return {"email": SUPPORT_EMAIL}


@app.get("/api/contacts")
def get_contacts():
    contacts = list(contacts_collection.find({}, {"_id": 0}))
    return {"contacts": contacts}
