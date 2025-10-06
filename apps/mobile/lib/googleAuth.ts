import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import Constants from 'expo-constants';

// This is required for the browser to close after authentication
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CONFIG = {
  androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  // Expo's auth proxy will handle the redirect
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'runflow',
    path: 'auth/callback',
  }),
};

export async function signInWithGoogle() {
  try {
    // Get the appropriate client ID based on platform
    const clientId = Constants.platform?.ios
      ? GOOGLE_OAUTH_CONFIG.iosClientId
      : GOOGLE_OAUTH_CONFIG.androidClientId;

    // Check if client ID is configured
    if (!clientId || clientId.includes('FILL_IN')) {
      return {
        success: false,
        error: Constants.platform?.ios
          ? 'iOS Google OAuth não configurado. Configure EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID no arquivo .env'
          : 'Android Google OAuth não configurado. Configure EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID no arquivo .env'
      };
    }

    // Create Supabase OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: GOOGLE_OAUTH_CONFIG.redirectUri,
        queryParams: {
          client_id: clientId,
        },
      },
    });

    if (error) throw error;

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      GOOGLE_OAUTH_CONFIG.redirectUri
    );

    if (result.type === 'success') {
      const { url } = result;

      // Extract tokens from the URL
      const params = new URLSearchParams(url.split('#')[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session with the tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        return { success: true };
      } else {
        throw new Error('No tokens found in OAuth response');
      }
    } else if (result.type === 'cancel') {
      return { success: false, error: 'OAuth cancelled by user' };
    } else {
      throw new Error('OAuth failed');
    }
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return { success: false, error: error.message || 'OAuth failed' };
  }
}
