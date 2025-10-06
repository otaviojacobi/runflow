# Google OAuth Setup for RunFlow Mobile (Native)

This guide explains how to configure Google OAuth for the RunFlow mobile app on iOS and Android.

## Prerequisites

- Google Cloud Console access
- Bundle ID: `com.runflow.app` (iOS)
- Package name: `com.runflow.app` (Android)

## Step 1: Create OAuth Credentials in Google Cloud Console

### For Android

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Android** as the application type
6. Fill in the details:
   - **Name**: `RunFlow Android`
   - **Package name**: `com.runflow.app`
   - **SHA-1 certificate fingerprint**: (see instructions below)

#### Getting SHA-1 Fingerprint

**For Development (Debug):**
```bash
cd apps/mobile
# For Expo managed workflow
expo fetch:android:hashes

# Or manually with keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For Production (Release):**
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

7. Click **Create**
8. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)
9. Paste it in `.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### For iOS

1. In the same **Credentials** page
2. Click **Create Credentials** → **OAuth client ID**
3. Select **iOS** as the application type
4. Fill in the details:
   - **Name**: `RunFlow iOS`
   - **Bundle ID**: `com.runflow.app`
5. Click **Create**
6. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)
7. Paste it in `.env` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Step 2: Configure Environment Variables

Update `/apps/mobile/.env`:

```bash
# Replace these with your actual Client IDs from Google Cloud Console
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

## Step 3: Configure Supabase

In your Supabase project:

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your **Client IDs**:
   - You can use the same web client ID or create separate ones
4. Add **Authorized redirect URIs**:
   - `runflow://auth/callback` (for native deep linking)

## Step 4: Test the OAuth Flow

1. Build and run the app on a device or emulator:
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   ```

2. Tap **"Entrar com Google"** on the login screen

3. You should see:
   - Google sign-in browser opens
   - Select your Google account
   - App automatically navigates to Profile after success

## Troubleshooting

### Android Issues

**Error: "Sign in failed"**
- Verify your SHA-1 fingerprint is correct
- Make sure package name matches exactly: `com.runflow.app`
- Check that the Client ID is added to `.env` correctly

**Deep link not working:**
```bash
# Test deep linking manually
adb shell am start -W -a android.intent.action.VIEW -d "runflow://auth/callback"
```

### iOS Issues

**Error: "Invalid client"**
- Verify Bundle ID matches exactly: `com.runflow.app`
- Check that iOS Client ID is in `.env`

**Deep link not working:**
- Make sure `scheme: 'runflow'` is in `app.config.js`
- Rebuild the app after config changes

### General Issues

**"No OAuth credentials found"**
- Check that env vars are loaded: `expo start --clear`
- Verify `.env` file has no typos

**"Redirect URI mismatch"**
- Ensure Supabase has `runflow://auth/callback` in authorized URIs
- Check that `scheme: 'runflow'` matches in `app.config.js`

## Technical Details

### Deep Linking

The app uses the custom scheme `runflow://` for OAuth callbacks:

- **Redirect URI**: `runflow://auth/callback`
- **Configured in**: `app.config.js`
- **Handled by**: `expo-auth-session` and `expo-web-browser`

### Storage

- **iOS**: Credentials stored in iOS Keychain (via Expo SecureStore)
- **Android**: Credentials stored in Android KeyStore (via Expo SecureStore)

### Flow Overview

1. User taps "Sign in with Google"
2. `signInWithGoogle()` creates OAuth URL via Supabase
3. `WebBrowser.openAuthSessionAsync()` opens browser
4. User authenticates with Google
5. Google redirects to `runflow://auth/callback#access_token=...`
6. App extracts tokens and calls `supabase.auth.setSession()`
7. User is navigated to Profile screen

## Files Modified

- `/apps/mobile/lib/googleAuth.ts` - OAuth implementation
- `/apps/mobile/app.config.js` - Deep linking config
- `/apps/mobile/.env` - Client IDs
- `/apps/mobile/screens/LoginScreen.tsx` - Google sign-in button
- `/apps/mobile/screens/RegisterScreen.tsx` - Google sign-up button

## Important Notes

- **Never commit** your `.env` file with real Client IDs
- Use **different Client IDs** for development and production
- Test on **real devices** for best results (simulators may have issues)
- **Rebuild** the app after changing `app.config.js`
