import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  OrganizationTheme,
  defaultTheme,
  loadTheme,
  saveTheme,
  clearTheme,
  fetchOrganizationTheme,
} from '../lib/theme';

interface ThemeContextType {
  theme: OrganizationTheme;
  isLoading: boolean;
  currentOrganizationId: string | null;
  updateTheme: (organizationId: string) => Promise<void>;
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

  const updateTheme = async (organizationId: string) => {
    try {
      // Only fetch if switching to a different organization
      if (organizationId === currentOrganizationId) {
        return;
      }

      setIsLoading(true);

      // Try to fetch theme from backend
      const fetchedTheme = await fetchOrganizationTheme(organizationId);

      if (fetchedTheme) {
        const newTheme = { ...defaultTheme, ...fetchedTheme };
        setTheme(newTheme);
        await saveTheme(fetchedTheme, organizationId);
        setCurrentOrganizationId(organizationId);
      } else {
        // If no custom theme, use default
        setTheme(defaultTheme);
        await saveTheme({}, organizationId);
        setCurrentOrganizationId(organizationId);
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Fallback to default theme
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
