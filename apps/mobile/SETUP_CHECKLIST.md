# RunFlow Mobile - Setup Checklist

## ✅ Completed Steps

- [x] Installed dependencies
- [x] Configured i18n (Portuguese/English)
- [x] Created auth screens (Login, Register, Forgot Password, etc.)
- [x] Set up native Google OAuth with Expo AuthSession
- [x] Configured deep linking (`runflow://`)
- [x] Android Google OAuth Client ID added to `.env`

## 🔲 Your Next Steps

### 1. Configure Supabase (Required for OAuth)

1. Go to your Supabase project dashboard
2. Navigate to: **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   runflow://auth/callback
   ```
4. Click **Save**

### 2. iOS Google OAuth Setup (When Ready)

When you're ready to test on iOS:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create **iOS OAuth Client**:
   - Type: iOS
   - Name: RunFlow iOS
   - Bundle ID: `com.runflow.app`
3. Copy the Client ID
4. Update `.env`:
   ```bash
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   ```
5. Restart Expo: `npm run dev`

### 3. Test the App

**Android:**
```bash
npm run android
```

**What to test:**
- ✅ App loads without errors
- ✅ Login screen shows with Google button
- ✅ Email/password login works
- ✅ Google OAuth button opens browser (Android only for now)
- ✅ After Google login, redirects back to app
- ✅ Profile screen shows user info
- ✅ Logout works

**iOS:**
```bash
npm run ios
```

On iOS without OAuth configured:
- ✅ App should load fine
- ✅ Email/password login works
- ⚠️ Google button shows helpful error message
- ✅ Other features work normally

## Current Configuration

### Environment Variables (.env)
```bash
✅ EXPO_PUBLIC_API_URL=http://localhost:3000
✅ EXPO_PUBLIC_SUPABASE_URL=http://localhost:8000
✅ EXPO_PUBLIC_SUPABASE_ANON_KEY=[configured]
✅ EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=[configured]
🔲 EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=[needs configuration]
```

### App Configuration (app.config.js)
```javascript
✅ scheme: 'runflow'
✅ bundleIdentifier: 'com.runflow.app' (iOS)
✅ package: 'com.runflow.app' (Android)
✅ Deep linking configured
```

### Features Status

| Feature | Android | iOS |
|---------|---------|-----|
| Email/Password Login | ✅ | ✅ |
| Email/Password Register | ✅ | ✅ |
| Forgot Password | ✅ | ✅ |
| Email Verification | ✅ | ✅ |
| Google OAuth | ✅ | 🔲 (needs iOS Client ID) |
| Profile Screen | ✅ | ✅ |
| Logout | ✅ | ✅ |
| Portuguese i18n | ✅ | ✅ |
| English i18n | ✅ | ✅ |

## Troubleshooting

### "OAuth não configurado" error on iOS
**Expected behavior** - You haven't added the iOS Client ID yet. The app will still work with email/password.

### Android OAuth not working
1. Check that you added `runflow://auth/callback` to Supabase redirect URLs
2. Verify package name in Google Cloud Console: `com.runflow.app`
3. Verify SHA-1 fingerprint matches your keystore
4. Restart the app: `npm run android`

### Deep link not opening app
```bash
# Test deep linking manually
adb shell am start -W -a android.intent.action.VIEW -d "runflow://auth/callback"
```

## Production Deployment

Before deploying to stores:

- [ ] Update API URL in `.env` to production URL
- [ ] Create production Google OAuth clients (separate from dev)
- [ ] Update Supabase redirect URLs for production
- [ ] Generate production keystores (Android) and certificates (iOS)
- [ ] Update SHA-1 fingerprints in Google Cloud Console
- [ ] Test OAuth flow on production environment
- [ ] Submit to Google Play Store / Apple App Store

## Support

See detailed documentation:
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - OAuth setup guide
- [README.md](./README.md) - General app documentation
