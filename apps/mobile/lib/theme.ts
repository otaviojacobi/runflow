// Theme configuration for organization customization in mobile app
// This system allows dynamic color switching based on organization settings
// Colors will be cached locally and applied to the entire app

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrganizationTheme } from '@repo/schemas/theme';

export type { OrganizationTheme };

// Default theme colors (can be overridden by organization settings)
export const defaultTheme: OrganizationTheme = {
  primary: '#3B82F6', // blue-600
  primaryForeground: '#F9FAFB', // gray-50
  secondary: '#F3F4F6', // gray-100
  secondaryForeground: '#111827', // gray-900
  accent: '#F3F4F6', // gray-100
  accentForeground: '#111827', // gray-900
  destructive: '#EF4444', // red-500
  destructiveForeground: '#F9FAFB', // gray-50
  muted: '#F3F4F6', // gray-100
  mutedForeground: '#6B7280', // gray-500
  background: '#FFFFFF', // white
  foreground: '#111827', // gray-900
  card: '#FFFFFF', // white
  cardForeground: '#111827', // gray-900
  border: '#E5E7EB', // gray-200
  input: '#E5E7EB', // gray-200
  ring: '#3B82F6', // blue-600
};

const THEME_STORAGE_KEY = '@runflow:theme';
const THEME_ORG_ID_KEY = '@runflow:theme_org_id';

// Save theme to local storage
export async function saveTheme(theme: Partial<OrganizationTheme>, organizationId: string): Promise<void> {
  try {
    const themeToSave = { ...defaultTheme, ...theme };
    await AsyncStorage.multiSet([
      [THEME_STORAGE_KEY, JSON.stringify(themeToSave)],
      [THEME_ORG_ID_KEY, organizationId],
    ]);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

// Load theme from local storage
export async function loadTheme(): Promise<{ theme: OrganizationTheme; organizationId: string | null }> {
  try {
    const result = await AsyncStorage.multiGet([
      THEME_STORAGE_KEY,
      THEME_ORG_ID_KEY,
    ]);

    const themeData = result[0]?.[1];
    const orgId = result[1]?.[1];

    if (themeData) {
      const parsedTheme = JSON.parse(themeData);
      return {
        theme: { ...defaultTheme, ...parsedTheme },
        organizationId: orgId || null,
      };
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }

  return { theme: defaultTheme, organizationId: null };
}

// Clear cached theme (useful when switching organizations or logging out)
export async function clearTheme(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([THEME_STORAGE_KEY, THEME_ORG_ID_KEY]);
  } catch (error) {
    console.error('Failed to clear theme:', error);
  }
}

// Utility function to apply alpha to a color
export function applyAlpha(color: string, alpha: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
