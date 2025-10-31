# Complete Testing Guide

This guide will help you test your Talent Marketplace application systematically.

## Table of Contents
1. [Setup Before Testing](#setup-before-testing)
2. [Backend API Testing](#backend-api-testing)
3. [Frontend Testing](#frontend-testing)
4. [Database Testing](#database-testing)
5. [Troubleshooting](#troubleshooting)

---

## Setup Before Testing

### 1. Start Your Servers

**Backend (Laravel):**
```bash
# Navigate to backend directory
cd /path/to/your/backend

# Start Laravel server
php artisan serve
# Should run on http://localhost:8000
```

**Frontend (Next.js):**
```bash
# Navigate to frontend directory
cd /path/to/your/frontend

# Start Next.js dev server
npm run dev
# Should run on http://localhost:3000
```

**Embedding Service (Optional but recommended for AI features):**
```bash
# Navigate to embedding service
cd /path/to/your/backend/embedding-service

# Activate virtual environment (if not already active)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the service
python app.py
# Should run on http://localhost:5000
```

### 2. Prepare Database

```bash
# Make sure your database is set up
php artisan migrate:fresh

# Seed with test data (if you have seeders)
php artisan db:seed
```

---

## Backend API Testing

### Option 1: Quick Bash Script Test (Recommended for beginners)

```bash
# Make the script executable
chmod +x test-backend-simple.sh

# Run the test
./test-backend-simple.sh
```

**What this tests:**
- ✅ API health check
- ✅ Public endpoints (projects, talents, categories, skills)
- ✅ User registration
- ✅ User login
- ✅ Authenticated user endpoint
- ✅ Embedding service status

**Expected Output:**
You should see green checkmarks (✅) for each test that passes and red X marks (❌) for tests that fail.

### Option 2: PHPUnit Test Suite (More comprehensive)

```bash
# Navigate to backend directory
cd /path/to/your/backend

# Copy the test file to your tests directory
cp BackendApiTest.php tests/Feature/

# Run the specific test
php artisan test --filter=BackendApiTest

# Or run all tests
php artisan test
```

**What this tests:**
- All API endpoints
- Database operations
- Authentication flow
- Profile creation
- Project management
- Skills management

### Option 3: Manual API Testing with Postman/Insomnia

1. Import the API collection (if you have one)
2. Test each endpoint manually
3. Check responses and status codes

**Key Endpoints to Test:**

```
GET  /api/v1/health
GET  /api/v1/public/projects
GET  /api/v1/public/talents
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me (requires auth token)
```

---

## Frontend Testing

### Option 1: Manual Testing Checklist

Use the `FRONTEND_TESTING_CHECKLIST.md` file to systematically test each page:

1. Open http://localhost:3000
2. Go through each section in the checklist
3. Mark items as working ✅ or broken ❌
4. Take notes on what needs fixing

**Start Here:**
```
1. Open browser: http://localhost:3000
2. Check if homepage loads
3. Navigate to /login
4. Try to register a new user
5. Log in with the new user
6. Explore the dashboard
```

### Option 2: Automated Frontend Tests (If you have them)

```bash
cd /path/to/your/frontend

# Run Jest tests (if configured)
npm test

# Run E2E tests with Playwright/Cypress (if configured)
npm run test:e2e
```

---

## Database Testing

### Check Database Seeding

```bash
# Fresh migration with seed
php artisan migrate:fresh --seed

# Check if tables have data
php artisan tinker
```

In Tinker:
```php
// Check users
User::count();

// Check projects
Project::count();

// Check skills
Skill::count();

// Check categories
Category::count();
```

---

## Quick Smoke Test

Here's a quick 5-minute test to see if core functionality works:

### Backend Smoke Test
```bash
# Test 1: Health check
curl http://localhost:8000/api/v1/health

# Test 2: Get projects
curl http://localhost:8000/api/v1/public/projects

# Test 3: Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","password_confirmation":"password123","role":"talent"}'
```

### Frontend Smoke Test
1. Open http://localhost:3000
2. Click on "Register" or "Login"
3. Try to register a new user
4. Check if you're redirected to dashboard
5. Click around to see what pages load

---

## Troubleshooting

### Backend Issues

**Error: Connection refused**
- Check if `php artisan serve` is running
- Check the port (should be 8000)
- Try: `php artisan serve --port=8000`

**Error: SQLSTATE connection**
- Check your `.env` file database configuration
- Run `php artisan migrate`
- Check if database exists

**Error: 500 Internal Server Error**
- Check `storage/logs/laravel.log` for errors
- Run `php artisan config:clear`
- Run `php artisan cache:clear`

### Frontend Issues

**Error: Cannot connect to API**
- Check if backend is running
- Check `.env.local` or environment variables
- Verify API URL is correct (http://localhost:8000)

**Error: Module not found**
- Run `npm install`
- Delete `node_modules` and run `npm install` again
- Check if all dependencies are installed

**Page shows blank/white screen**
- Check browser console (F12) for errors
- Check if Next.js dev server is running
- Try clearing browser cache

---

## Test Results Template

After running tests, document your findings:

```
Date: __________
Tested by: __________

BACKEND STATUS:
✅ Working: _____________
❌ Not Working: _____________
⚠️  Needs Attention: _____________

FRONTEND STATUS:
✅ Working: _____________
❌ Not Working: _____________
⚠️  Needs Attention: _____________

PRIORITY FIXES:
1. _____________
2. _____________
3. _____________

NEXT STEPS:
1. _____________
2. _____________
3. _____________
```

---

## Getting Help

If tests fail, collect this information:
1. Error messages (full text)
2. What you were trying to do
3. Which test failed
4. Browser console errors (for frontend)
5. Laravel log errors (for backend)

Then we can debug together!

---

## Quick Command Reference

```bash
# Backend
php artisan serve              # Start server
php artisan migrate:fresh      # Reset database
php artisan test              # Run tests
php artisan tinker            # Database console

# Frontend  
npm run dev                   # Start dev server
npm run build                 # Build for production
npm test                      # Run tests (if configured)

# Embedding Service
cd embedding-service
source venv/bin/activate      # Activate virtual env
python app.py                 # Start service
```

---

Good luck with testing! Start with the backend API tests first, then move to frontend testing.
