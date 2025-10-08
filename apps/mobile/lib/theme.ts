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

// Convert HSL to hex color (for when we receive HSL from backend)
export function hslToHex(hsl: string): string {
  // Parse HSL string like "hsl(221.2 83.2% 53.3%)"
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/);

  if (!match || !match[1] || !match[2] || !match[3]) {
    // If not HSL format, assume it's already a hex color
    return hsl.startsWith('#') ? hsl : `#${hsl}`;
  }

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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

// Fetch theme from backend
export async function fetchOrganizationTheme(organizationId: string): Promise<Partial<OrganizationTheme> | null> {
  try {
    // Import api module dynamically to avoid circular dependencies
    const { api } = await import('./api');

    const data = await api.getOrganizationTheme(organizationId);

    // Convert HSL colors to hex if needed
    const convertedTheme: Partial<OrganizationTheme> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        convertedTheme[key as keyof OrganizationTheme] = hslToHex(value);
      }
    }

    return convertedTheme;
  } catch (error) {
    console.error('Failed to fetch organization theme:', error);
    return null;
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
