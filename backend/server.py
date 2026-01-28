from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timezone
import os

app = FastAPI(title="Beskar IT API")

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


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "This is the way"}


@app.post("/api/contact")
def submit_contact(form: ContactForm):
    try:
        contact_data = {
            "name": form.name,
            "email": form.email,
            "company": form.company,
            "message": form.message,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = contacts_collection.insert_one(contact_data)
        return {
            "success": True,
            "message": "Thank you for reaching out. We'll be in touch soon.",
            "id": str(result.inserted_id),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/contacts")
def get_contacts():
    contacts = list(contacts_collection.find({}, {"_id": 0}))
    return {"contacts": contacts}
