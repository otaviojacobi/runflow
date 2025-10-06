# Email Verification Setup

## ✅ Implementation Complete

Email verification has been fully configured for your application with:
- ✅ Post-registration verification page
- ✅ Email link verification (click link in email)
- ✅ Manual OTP code entry (6-digit code)
- ✅ Resend confirmation email functionality
- ✅ Proper redirect handling through Kong gateway

## Current Configuration

Email verification has been enabled in `supabase/config.toml`:
- `enable_confirmations = true` - Users must confirm their email before signing in
- Local/test environments use **Inbucket** (port 54324) to capture emails
- Production uses **SendGrid SMTP** (configured, awaiting real API key)

## Local Development

Inbucket is configured for local email testing via docker-compose:
- **Web interface**: http://localhost:9000
- **SMTP port**: 2500 (internal to Docker)
- All emails sent during local development appear in Inbucket
- **IMPORTANT**: `GOTRUE_MAILER_AUTOCONFIRM` is set to `false` in docker-compose.yml
- After config changes, restart Docker: `docker compose down && docker compose up -d`

## Production Email Options

### Option 1: Supabase Email Service (Recommended for most projects)
- Built-in email service provided by Supabase
- Available on Pro plan and above
- No configuration needed in your code
- Configure in your Supabase project dashboard under Authentication > Email Templates
- **Pros**: Zero configuration, reliable, managed by Supabase
- **Cons**: Requires paid Supabase plan

### Option 2: Custom SMTP Provider
Configure your own SMTP service in `supabase/config.toml`:

```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"  # or your provider
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "noreply@yourdomain.com"
sender_name = "Your App Name"
```

#### Popular SMTP Providers:
- **SendGrid**: Free tier (100 emails/day), easy setup
- **Mailgun**: Free tier (5,000 emails/month), developer-friendly
- **AWS SES**: Pay-as-you-go, very reliable
- **Postmark**: Transactional email specialist
- **Resend**: Modern API, developer-focused

#### Environment Variables for SMTP:
Add to your production environment:
```bash
SENDGRID_API_KEY="your_api_key_here"
# or
MAILGUN_API_KEY="your_api_key_here"
```

## Email Templates

Customize email templates in `supabase/config.toml`:

```toml
[auth.email.template.confirmation]
subject = "Confirm your email"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.invite]
subject = "You have been invited"
content_path = "./supabase/templates/invite.html"

[auth.email.template.magic_link]
subject = "Your Magic Link"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.recovery]
subject = "Reset your password"
content_path = "./supabase/templates/recovery.html"
```

## Testing Email Verification

### Local Testing:
1. Start Supabase: `npx supabase start`
2. Sign up a new user
3. Check Inbucket at http://localhost:54324 for the confirmation email
4. Click the confirmation link

### Production Testing:
1. Deploy with your chosen email provider configured
2. Test with a real email address
3. Verify emails are being sent and received
4. Check spam folders if emails don't arrive

## Configuration Settings

Current auth settings in `supabase/config.toml`:
- `enable_confirmations = true` - Email verification required
- `double_confirm_changes = true` - Confirm both old and new email on changes
- `max_frequency = "1s"` - Rate limit for sending emails
- `otp_expiry = 3600` - OTP valid for 1 hour

## What Was Implemented

### 1. **Email Configuration**
- **For local**: Configured in `docker-compose.yml:44-49`
  - Uses Inbucket on port 9000
  - `GOTRUE_MAILER_AUTOCONFIRM: "false"` - Requires email verification
  - `GOTRUE_SMTP_HOST: "inbucket"` - Routes emails to Inbucket
- **For production**: Configure in your production Supabase dashboard
  - Host: `smtp.sendgrid.net`
  - Port: `587`
  - User: `apikey`
  - Pass: Your SendGrid API key
  - Sender: `noreply@runflow.app` (RunFlow)
  - **Important**: Set `GOTRUE_MAILER_AUTOCONFIRM: "false"` in production too!

### 2. **Environment Variables**
- Added `SENDGRID_API_KEY="TODO_REPLACE_REAL_KEY"` to:
  - `.env`
  - `apps/web/.env`

### 3. **Test Utilities**
- File: `apps/web/lib/supabase/test-client.ts`
- Added `createVerifiedTestUser()` function to auto-verify emails in tests
- Updated all test files to use this helper:
  - `__tests__/api/auth/register.test.ts`
  - `__tests__/api/auth/login.test.ts`
  - `__tests__/api/auth/auth-flow.test.ts`

### 4. **Profile Page Updates**
- File: `apps/web/app/[locale]/profile/page.tsx`
- Shows email verification status (✓ Verified or ⚠ Not Verified)
- Displays confirmation date when verified
- Shows resend button when not verified

### 5. **Resend Confirmation Feature**
- Component: `components/auth/ResendConfirmationButton.tsx`
- API Route: `app/api/auth/resend-confirmation/route.ts`
- Allows users to resend verification emails
- Includes success/error feedback

### 6. **Post-Registration Flow**
- Registration redirects to `/verify-email?email={email}`
- Page: `app/[locale]/verify-email/page.tsx`
- Shows "Check your email" message
- Allows manual OTP entry (6-digit code)
- Includes resend email button

### 7. **Email Verification Handler**
- Route: `app/auth/verify/route.ts`
- Handles email verification links from emails
- Verifies OTP tokens
- Redirects to profile on success

### 8. **Fixed Docker Configuration**
- `API_EXTERNAL_URL: "http://localhost:8000"` (was :9999)
- Routes verification links through Kong gateway
- Ensures proper URL handling

## Next Steps

1. **Get SendGrid API Key**:
   - Sign up at https://sendgrid.com
   - Create an API key with "Mail Send" permissions
   - Replace `TODO_REPLACE_REAL_KEY` in your production environment variables

2. **Verify Sender Email** (SendGrid requires this):
   - In SendGrid dashboard, verify `noreply@runflow.app` or your desired sender
   - Or use Single Sender Verification for testing

3. **Test Locally**:
   ```bash
   # Restart Docker to apply config changes
   docker compose down
   docker compose up -d

   # Visit http://localhost:9000 to see test emails in Inbucket
   # Register a new user and check Inbucket for the verification email
   ```

4. **Test in Production**:
   - Deploy with real SendGrid API key
   - Register a new user
   - Check that confirmation emails arrive
   - Test resend functionality on profile page

## Configuration Settings

Current auth settings in `supabase/config.toml`:
- `enable_confirmations = true` - Email verification required
- `double_confirm_changes = true` - Confirm both old and new email on changes
- `max_frequency = "1s"` - Rate limit for sending emails
- `otp_expiry = 3600` - OTP valid for 1 hour
