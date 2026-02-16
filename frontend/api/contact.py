from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib
import time
from datetime import datetime, timezone

# Try to import optional dependencies
try:
    from pymongo import MongoClient
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False

try:
    import sib_api_v3_sdk
    from sib_api_v3_sdk.rest import ApiException
    BREVO_AVAILABLE = True
except ImportError:
    BREVO_AVAILABLE = False

# In-memory rate limiting (resets on cold start, but provides basic protection)
# For production, consider using Redis or MongoDB for persistent rate limiting
RATE_LIMIT_WINDOW = 3600  # 1 hour window
MAX_REQUESTS_PER_WINDOW = 5  # Max 5 submissions per hour per IP/email
rate_limit_store = {}


def get_rate_limit_key(ip, email):
    """Generate a rate limit key from IP and email"""
    combined = f"{ip}:{email}".lower()
    return hashlib.md5(combined.encode()).hexdigest()


def check_rate_limit(ip, email):
    """Check if request is rate limited. Returns (is_allowed, remaining, reset_time)"""
    current_time = time.time()
    key = get_rate_limit_key(ip, email)
    
    # Clean up expired entries
    expired_keys = [k for k, v in rate_limit_store.items() if current_time - v['window_start'] > RATE_LIMIT_WINDOW]
    for k in expired_keys:
        del rate_limit_store[k]
    
    if key not in rate_limit_store:
        rate_limit_store[key] = {
            'count': 1,
            'window_start': current_time
        }
        return True, MAX_REQUESTS_PER_WINDOW - 1, int(current_time + RATE_LIMIT_WINDOW)
    
    entry = rate_limit_store[key]
    window_elapsed = current_time - entry['window_start']
    
    # Reset window if expired
    if window_elapsed > RATE_LIMIT_WINDOW:
        rate_limit_store[key] = {
            'count': 1,
            'window_start': current_time
        }
        return True, MAX_REQUESTS_PER_WINDOW - 1, int(current_time + RATE_LIMIT_WINDOW)
    
    # Check if limit exceeded
    if entry['count'] >= MAX_REQUESTS_PER_WINDOW:
        reset_time = int(entry['window_start'] + RATE_LIMIT_WINDOW)
        return False, 0, reset_time
    
    # Increment counter
    entry['count'] += 1
    remaining = MAX_REQUESTS_PER_WINDOW - entry['count']
    reset_time = int(entry['window_start'] + RATE_LIMIT_WINDOW)
    return True, remaining, reset_time


def check_rate_limit_db(db, ip, email):
    """Check rate limit using MongoDB for persistence across serverless invocations"""
    if not db:
        return check_rate_limit(ip, email)
    
    try:
        current_time = time.time()
        key = get_rate_limit_key(ip, email)
        window_start = current_time - RATE_LIMIT_WINDOW
        
        # Count submissions in the current window
        count = db["rate_limits"].count_documents({
            "key": key,
            "timestamp": {"$gte": window_start}
        })
        
        if count >= MAX_REQUESTS_PER_WINDOW:
            # Find earliest submission to calculate reset time
            earliest = db["rate_limits"].find_one(
                {"key": key, "timestamp": {"$gte": window_start}},
                sort=[("timestamp", 1)]
            )
            reset_time = int(earliest['timestamp'] + RATE_LIMIT_WINDOW) if earliest else int(current_time + RATE_LIMIT_WINDOW)
            return False, 0, reset_time
        
        # Record this submission
        db["rate_limits"].insert_one({
            "key": key,
            "ip": ip,
            "email": email,
            "timestamp": current_time
        })
        
        # Clean up old entries (older than 24 hours)
        db["rate_limits"].delete_many({
            "timestamp": {"$lt": current_time - 86400}
        })
        
        remaining = MAX_REQUESTS_PER_WINDOW - count - 1
        return True, remaining, int(current_time + RATE_LIMIT_WINDOW)
    except Exception as e:
        print(f"Rate limit DB error: {e}")
        # Fall back to in-memory rate limiting
        return check_rate_limit(ip, email)


def get_db():
    """Get MongoDB connection"""
    if not MONGO_AVAILABLE:
        return None
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "beskarit")
    if not mongo_url:
        return None
    client = MongoClient(mongo_url)
    return client[db_name]


def send_notification_email(form_data):
    """Send email notification using Brevo"""
    if not BREVO_AVAILABLE:
        return None
    
    brevo_api_key = os.environ.get("BREVO_API_KEY")
    if not brevo_api_key:
        return None
    
    support_email = os.environ.get("SUPPORT_EMAIL", "support@beskarit.com")
    sender_email = os.environ.get("SENDER_EMAIL", "notifications@beskarit.com")
    sender_name = os.environ.get("SENDER_NAME", "Beskar IT")
    
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = brevo_api_key
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0f172a; padding: 30px; border-radius: 8px;">
            <h1 style="color: #38bdf8; margin-bottom: 20px;">New Contact Form Submission</h1>
            <div style="background-color: #1e293b; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Name:</strong> {form_data['name']}</p>
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Email:</strong> {form_data['email']}</p>
                <p style="color: #94a3b8; margin: 0 0 10px 0;"><strong style="color: #f8fafc;">Company:</strong> {form_data.get('company') or 'Not provided'}</p>
            </div>
            <div style="background-color: #1e293b; padding: 20px; border-radius: 4px;">
                <p style="color: #f8fafc; margin: 0 0 10px 0;"><strong>Message:</strong></p>
                <p style="color: #94a3b8; margin: 0; white-space: pre-wrap;">{form_data['message']}</p>
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
        to=[{"email": support_email, "name": "Beskar IT Support"}],
        sender={"email": sender_email, "name": sender_name},
        reply_to={"email": form_data['email'], "name": form_data['name']},
        subject=f"New Contact: {form_data['name']} - {form_data.get('company') or 'Individual'}",
        html_content=html_content
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        return api_response.message_id
    except Exception:
        return None


def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle contact form submission"""
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        
        try:
            # Get client IP
            client_ip = self.headers.get('X-Forwarded-For', '').split(',')[0].strip() or \
                       self.headers.get('X-Real-IP', '') or \
                       self.client_address[0] if hasattr(self, 'client_address') else 'unknown'
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            form_data = json.loads(body)
            
            # Validate required fields
            name = form_data.get('name', '').strip()
            email = form_data.get('email', '').strip()
            message = form_data.get('message', '').strip()
            company = form_data.get('company', '').strip()
            
            if not name or not email or not message:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "detail": "Name, email, and message are required fields."
                }).encode())
                return
            
            if not validate_email(email):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "detail": "Please provide a valid email address."
                }).encode())
                return
            
            # Check rate limit
            db = get_db()
            is_allowed, remaining, reset_time = check_rate_limit_db(db, client_ip, email)
            
            if not is_allowed:
                self.send_response(429)
                self.send_header('Content-Type', 'application/json')
                self.send_header('X-RateLimit-Limit', str(MAX_REQUESTS_PER_WINDOW))
                self.send_header('X-RateLimit-Remaining', '0')
                self.send_header('X-RateLimit-Reset', str(reset_time))
                self.send_header('Retry-After', str(reset_time - int(time.time())))
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "detail": "Too many submissions. Please try again later.",
                    "retry_after_seconds": reset_time - int(time.time())
                }).encode())
                return
            
            support_email = os.environ.get("SUPPORT_EMAIL", "support@beskarit.com")
            contact_id = None
            
            # Save to MongoDB if available
            if db:
                try:
                    contact_data = {
                        "name": name,
                        "email": email,
                        "company": company,
                        "message": message,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "notification_email": support_email,
                        "client_ip": client_ip
                    }
                    result = db["contacts"].insert_one(contact_data)
                    contact_id = str(result.inserted_id)
                except Exception as e:
                    print(f"MongoDB error: {e}")
            
            # Send email notification
            email_id = None
            try:
                email_id = send_notification_email({
                    "name": name,
                    "email": email,
                    "company": company,
                    "message": message
                })
            except Exception as e:
                print(f"Email error: {e}")
            
            # Success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                "success": True,
                "message": f"Thank you for reaching out. Our team at {support_email} will be in touch soon.",
                "email_sent": email_id is not None
            }
            if contact_id:
                response["id"] = contact_id
            
            self.wfile.write(json.dumps(response).encode())
            
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "detail": "Invalid JSON in request body."
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "detail": "An unexpected error occurred. Please try again later."
            }).encode())
    
    def do_GET(self):
        """Health check"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "healthy",
            "message": "Contact API is running"
        }).encode())
