import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  OrganizationTheme,
  defaultTheme,
  loadTheme,
  saveTheme,
  clearTheme,
} from '../lib/theme';

interface OrgColors {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

interface ThemeContextType {
  theme: OrganizationTheme;
  isLoading: boolean;
  currentOrganizationId: string | null;
  updateTheme: (organizationId: string, colors?: OrgColors) => Promise<void>;
  resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<OrganizationTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);

  // Load cached theme on mount
  useEffect(() => {
    loadCachedTheme();
  }, []);

  const loadCachedTheme = async () => {
    try {
      const { theme: cachedTheme, organizationId } = await loadTheme();
      setTheme(cachedTheme);
      setCurrentOrganizationId(organizationId);
    } catch (error) {
      console.error('Failed to load cached theme:', error);
      setTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (organizationId: string, colors?: OrgColors) => {
    try {
      setIsLoading(true);

      // Build partial theme from organization color fields
      const partialTheme: Partial<OrganizationTheme> = {};
      if (colors?.primaryColor) {
        partialTheme.primary = colors.primaryColor;
        partialTheme.ring = colors.primaryColor;
      }
      if (colors?.secondaryColor) {
        partialTheme.secondary = colors.secondaryColor;
      }

      const newTheme = { ...defaultTheme, ...partialTheme };
      setTheme(newTheme);
      await saveTheme(partialTheme, organizationId);
      setCurrentOrganizationId(organizationId);
    } catch (error) {
      console.error('Failed to update theme:', error);
      setTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTheme = async () => {
    try {
      await clearTheme();
      setTheme(defaultTheme);
      setCurrentOrganizationId(null);
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLoading,
        currentOrganizationId,
        updateTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
