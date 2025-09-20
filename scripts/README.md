# 🔧 Testing Scripts

This directory contains automated test scripts for the Gigrilla authentication system and API endpoints.

## 📋 Available Scripts

### Quick Health Check
```bash
npm run test:health
```
- Fast verification that core systems are working
- Tests database connection, auth status, API endpoints, and session management
- Returns exit code 0 if all tests pass, 1 if any fail

### Detailed Authentication Test
```bash
npm run test:auth
```
- Comprehensive authentication system testing
- Tests database connection, auth status, session management, API endpoints, and RLS policies
- Creates test users and verifies the complete auth flow

### API Endpoints Test
```bash
npm run test:api
```
- Focused testing of API endpoints
- Tests fan profile API, fan status API, database tables, and RLS policies
- Verifies data integrity and security policies

## 🧪 Testing Workflow

### 1. Development Testing
```bash
# Quick check during development
npm run test:health

# Detailed testing when making auth changes
npm run test:auth

# API-specific testing
npm run test:api
```

### 2. CI/CD Integration
```bash
# In your CI pipeline
npm run test:health && npm run test:api
```

### 3. Manual Testing
```bash
# Run individual tests
node scripts/health-check.js
node scripts/test-auth.js
node scripts/test-api.js
```

## 📊 Test Results

### ✅ Success Indicators
- Database connection: ✅ PASS
- Authentication: ✅ PASS (when logged in)
- API endpoints: ✅ PASS (when authenticated)
- Session management: ✅ PASS (when session exists)

### ❌ Failure Indicators
- Database connection: ❌ FAIL (Supabase down or misconfigured)
- Authentication: ❌ FAIL (no active session or auth issues)
- API endpoints: ❌ FAIL (401 Unauthorized or 500 errors)
- Session management: ❌ FAIL (session retrieval issues)

## 🔧 Troubleshooting

### Common Issues

**1. Environment Variables Missing**
```
❌ Missing Supabase environment variables
```
Solution: Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**2. Database Connection Failed**
```
❌ Database connection failed
```
Solution: Verify Supabase project is running and credentials are correct

**3. Authentication Failed**
```
❌ No authenticated user found
```
Solution: Log in through the web interface first, then run tests

**4. API Endpoints Failing**
```
❌ API endpoints: 401 Unauthorized
```
Solution: Authentication required - log in first or use test user creation

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=* npm run test:auth
```

## 🎯 Testing Authentication Fix

To test the authentication session sync fix:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Log in through the web interface:**
   - Go to `http://localhost:3000/login`
   - Use existing credentials or create test user

3. **Run health check:**
   ```bash
   npm run test:health
   ```
   Should show:
   ```
   ✅ PASS: Database connection
   ✅ PASS: Authentication
   ✅ PASS: API endpoints
   ✅ PASS: Session management
   ```

4. **Refresh the page and test again:**
   - The auth should persist after refresh
   - No more "user: null" errors in console

## 🚀 Integration Examples

### GitHub Actions
```yaml
- name: Test Authentication
  run: npm run test:health

- name: Test API Endpoints
  run: npm run test:api
```

### Docker
```dockerfile
# Test stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run test:health
```

## 📝 Adding New Tests

To add new test scripts:

1. Create `scripts/test-your-feature.js`
2. Add to `package.json` scripts section
3. Follow the pattern of existing test scripts
4. Export the main function and handle errors properly

Example:
```javascript
async function testYourFeature() {
  console.log('🧪 Testing your feature...');
  // Your test logic here
}

testYourFeature().catch(console.error);
```
