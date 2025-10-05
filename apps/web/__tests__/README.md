# Authentication API Tests

This directory contains automated tests for the authentication API endpoints (`/api/auth/register` and `/api/auth/login`).

## Test Structure

The tests are organized into two categories:

### 1. Validation Tests (Always Run)
These tests validate the basic functionality of the API endpoints:
- Input validation (missing email, missing password)
- Error handling
- Endpoint availability

**These tests run without requiring Supabase Auth to be running.**

### 2. Integration Tests (Requires Supabase)
These tests verify the full authentication flow:
- User registration with Supabase Auth
- User profile creation in the database
- User login with correct credentials
- Login failure scenarios
- Full register -> login flow

**These tests are skipped by default** (marked with `it.skip()`) because they require a fully running Supabase instance.

## Running Tests

### Run Validation Tests Only
```bash
npm test
```

This runs the basic validation tests that don't require external services.

### Run All Tests (Including Integration Tests)

**Prerequisites:**
1. Start Supabase:
   ```bash
   npm run start:supabase
   ```
   Wait for all services to be ready (this may take a few minutes on first run).

2. Verify Supabase is running:
   ```bash
   npx supabase status
   ```

3. In the test files, remove `.skip` from the integration tests you want to run:
   - `__tests__/api/auth/register.test.ts`
   - `__tests__/api/auth/login.test.ts`
   - `__tests__/api/auth/auth-flow.test.ts`

4. Run the tests:
   ```bash
   npm test
   ```

### Run Specific Test Suites
```bash
# Run only register tests
npm test register.test.ts

# Run only login tests
npm test login.test.ts

# Run full auth flow tests
npm test auth-flow.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

## Test Results

As of the latest run:
- ✅ **5 validation tests passing**
- ⏭️ **7 integration tests skipped** (require Supabase)
- 📊 **Test Suites: 3 passed, 3 total**

## Current Test Coverage

### `/api/auth/register`
- ✅ Returns 400 if email is missing
- ✅ Returns 400 if password is missing
- ⏭️ Registers new user with email, password, and name (integration)

### `/api/auth/login`
- ✅ Returns 400 if email is missing
- ✅ Returns 400 if password is missing
- ⏭️ Logs in with correct credentials (integration)
- ⏭️ Returns 401 with incorrect password (integration)
- ⏭️ Returns 401 with non-existent email (integration)

### Full Authentication Flow
- ✅ Endpoints are properly defined
- ⏭️ Complete register -> login flow (integration)
- ⏭️ Login fails with wrong password after registration (integration)
- ⏭️ Handles multiple login attempts (integration)

## Notes

- Integration tests automatically clean up test users after each run
- Test users are created with timestamp-based emails to avoid conflicts
- The database connection is properly closed after all tests complete
- Some tests may show warnings about Yarn/Corepack - these can be safely ignored
