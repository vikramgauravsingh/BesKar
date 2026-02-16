from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Check MongoDB connectivity
        mongo_status = "unconfigured"
        try:
            mongo_url = os.environ.get("MONGO_URL")
            if mongo_url:
                from pymongo import MongoClient
                client = MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
                client.admin.command('ping')
                mongo_status = "connected"
        except Exception as e:
            mongo_status = f"error: {str(e)[:50]}"
        
        # Check Brevo configuration
        brevo_status = "configured" if os.environ.get("BREVO_API_KEY") else "unconfigured"
        
        response = {
            "status": "healthy",
            "message": "This is the way",
            "services": {
                "mongodb": mongo_status,
                "brevo_email": brevo_status
            },
            "environment": {
                "support_email": os.environ.get("SUPPORT_EMAIL", "support@beskarit.com"),
                "db_name": os.environ.get("DB_NAME", "beskarit")
            }
        }
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
