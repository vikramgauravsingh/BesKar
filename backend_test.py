#!/usr/bin/env python3
"""
Backend API Testing for Beskar IT Website
Tests health check and contact form submission endpoints
"""

import requests
import sys
import json
from datetime import datetime

class BeskarAPITester:
    def __init__(self, base_url="https://demobackend.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_health_endpoint(self):
        """Test GET /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and "This is the way" in data.get("message", ""):
                    self.log_test("Health Check", True, f"Status: {response.status_code}, Response: {data}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Request failed: {str(e)}")
            return False

    def test_contact_submission(self):
        """Test POST /api/contact endpoint"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "company": "Test Company",
            "message": "This is a test message for API testing"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/contact",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "id" in data:
                    self.log_test("Contact Form Submission", True, f"Contact saved with ID: {data.get('id')}")
                    return data.get("id")
                else:
                    self.log_test("Contact Form Submission", False, f"Unexpected response format: {data}")
                    return None
            else:
                self.log_test("Contact Form Submission", False, f"Status code: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Contact Form Submission", False, f"Request failed: {str(e)}")
            return None

    def test_contact_validation(self):
        """Test contact form validation with invalid data"""
        invalid_data = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email
            "message": ""  # Empty message
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/contact",
                json=invalid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 for validation error
            if response.status_code == 422:
                self.log_test("Contact Form Validation", True, "Properly rejected invalid data")
                return True
            else:
                self.log_test("Contact Form Validation", False, f"Expected 422, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Contact Form Validation", False, f"Request failed: {str(e)}")
            return False

    def test_get_contacts(self):
        """Test GET /api/contacts endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/contacts", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "contacts" in data and isinstance(data["contacts"], list):
                    self.log_test("Get Contacts", True, f"Retrieved {len(data['contacts'])} contacts")
                    return True
                else:
                    self.log_test("Get Contacts", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Get Contacts", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Contacts", False, f"Request failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Beskar IT Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("-" * 50)
        
        # Test health endpoint
        self.test_health_endpoint()
        
        # Test contact form submission
        contact_id = self.test_contact_submission()
        
        # Test form validation
        self.test_contact_validation()
        
        # Test get contacts
        self.test_get_contacts()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = BeskarAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%",
                "timestamp": datetime.now().isoformat()
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())