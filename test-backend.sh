#!/bin/bash

echo "🔍 Testing Backend Endpoints"
echo "=============================="
echo ""

# Test different possible endpoint structures
echo "Testing Option A: http://localhost:8000/auth/login"
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.talent@test.com","password":"Password123!"}' \
  | jq '.' 2>/dev/null || echo "❌ Failed"

echo ""
echo "---"
echo ""

echo "Testing Option B: http://localhost:8000/api/v1/auth/login"
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.talent@test.com","password":"Password123!"}' \
  | jq '.' 2>/dev/null || echo "❌ Failed"

echo ""
echo "---"
echo ""

echo "Testing Option C: http://localhost:8000/api/auth/login"
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.talent@test.com","password":"Password123!"}' \
  | jq '.' 2>/dev/null || echo "❌ Failed"

echo ""
echo "=============================="
echo "✅ Whichever option returns JSON with 'token' is correct!"
echo "Update NEXT_PUBLIC_API_BASE_URL in .env.local accordingly"