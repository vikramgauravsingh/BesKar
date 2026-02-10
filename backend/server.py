from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import logging
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Beskar IT API")

# Support email for all notifications
SUPPORT_EMAIL = os.environ.get("SUPPORT_EMAIL", "support@beskarIT.com")

# Brevo (Sendinblue) configuration
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "notifications@beskarit.com")
SENDER_NAME = os.environ.get("SENDER_NAME", "Beskar IT")

# Configure Brevo API
configuration = sib_api_v3_sdk.Configuration()
if BREVO_API_KEY:
    configuration.api_key['api-key'] = BREVO_API_KEY
    logger.info("Brevo API configured successfully")
else:
    logger.warning("BREVO_API_KEY not configured - email notifications disabled")

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


def send_notification_email(form: ContactForm):
    """Send email notification to support team using Brevo"""
    if not BREVO_API_KEY:
        logger.warning("Email notification skipped - BREVO_API_KEY not configured")
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
    
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": SUPPORT_EMAIL, "name": "Beskar IT Support"}],
        sender={"email": SENDER_EMAIL, "name": SENDER_NAME},
        reply_to={"email": form.email, "name": form.name},
        subject=f"New Contact: {form.name} - {form.company or 'Individual'}",
        html_content=html_content
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Notification email sent successfully. Message ID: {api_response.message_id}")
        return api_response.message_id
    except ApiException as e:
        logger.error(f"Failed to send notification email: {e}")
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
        
        # Send email notification
        email_id = send_notification_email(form)
        
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
