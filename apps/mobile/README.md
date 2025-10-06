# RunFlow Mobile App

React Native mobile application for RunFlow with authentication flow matching the web app design.

## Features

- **Authentication Flow**
  - Login with email/password
  - Registration with email/password
  - Google OAuth sign-in with proper icon
  - Email verification
  - Forgot password flow
  - User profile view

- **Internationalization (i18n)**
  - Portuguese (default)
  - English
  - Easy to add more languages

- **Design**
  - Matches web app styling with gradient backgrounds
  - Clean forms without excessive titles
  - Responsive layouts
  - Custom password input with show/hide toggle
  - Loading states and error handling

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the mobile app directory:

```env
# API Backend URL (point to the web app API)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Supabase configuration (same as web app)
EXPO_PUBLIC_SUPABASE_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare Turnstile for captcha (optional)
EXPO_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### Running the App

```bash
# Start Expo dev server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Architecture

### Authentication

The mobile app uses the same backend API as the web app:

- **API Endpoints**: All auth endpoints are accessed via the backend API (`/api/auth/*`)
- **Session Management**: Supabase client handles session storage using Expo SecureStore
- **CORS**: Backend API configured to accept requests from any source

### Navigation

Uses React Navigation with the following screens:

- `LoginScreen` - Email/password login
- `RegisterScreen` - User registration
- `ForgotPasswordScreen` - Password reset
- `VerifyEmailScreen` - Email verification message
- `ProfileScreen` - User profile and logout

### State Management

- Auth state managed by Supabase client
- Local state using React hooks
- Navigation state managed by React Navigation

### Session Storage

The app uses platform-specific storage for session persistence:

- **Web**: localStorage (browser storage)
- **iOS/Android**: Expo SecureStore (encrypted native storage)

This ensures sessions persist across app restarts on all platforms.

## API Integration

The mobile app communicates with the backend API for authentication:

```typescript
// Example: Login API call
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

## Styling

The mobile app uses the same color scheme as the web app:

- **Primary Blue**: `#2563EB`
- **Cyan Accent**: `#0284C7`
- **Gradient Background**: Cyan → Blue → Violet tones
- **Gray Scale**: Tailwind CSS gray palette

## Internationalization

The app supports multiple languages using `i18next` and `react-i18next`. Default language is Portuguese.

### Adding a New Language

1. Create a new JSON file in `i18n/locales/` (e.g., `es.json`)
2. Add translations following the same structure as `pt.json`
3. Import and register in `i18n/index.ts`:

```typescript
import es from './locales/es.json';

i18n.init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es }, // Add new language
  },
  // ...
});
```

### Changing Default Language

Edit `i18n/index.ts`:

```typescript
i18n.init({
  lng: 'en', // Change from 'pt' to your preferred language
  fallbackLng: 'pt',
  // ...
});
```

## Google OAuth Setup

The mobile app uses **native Google OAuth** for iOS and Android. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions.

**Quick setup:**
1. Create OAuth clients in Google Cloud Console (one for Android, one for iOS)
2. Add Client IDs to `.env`:
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
3. Add `runflow://auth/callback` to Supabase authorized URIs
4. Run on device: `npm run android` or `npm run ios`

## Differences from Web App

1. **No Marketing Page**: Mobile app starts directly at the auth flow
2. **No Title Cards**: Cleaner UI without "Welcome back" or "Create account" titles
3. **Native Components**: Uses React Native components instead of HTML/web
4. **Touch Interactions**: Optimized for mobile touch inputs
5. **Secure Storage**: Uses Expo SecureStore for session persistence (iOS Keychain/Android KeyStore)
6. **Portuguese First**: Default language is Portuguese (web app is English)
7. **Native OAuth**: Uses Expo AuthSession for Google sign-in (not web OAuth)
8. **No Web Support**: Mobile app is native-only (iOS/Android), not for web browsers
