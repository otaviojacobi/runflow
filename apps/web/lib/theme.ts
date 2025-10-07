// Theme configuration for organization customization
// This system allows dynamic color switching based on organization settings

export interface OrganizationTheme {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  muted: string
  mutedForeground: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  border: string
  input: string
  ring: string
}

// Default theme colors (can be overridden by organization settings)
export const defaultTheme: OrganizationTheme = {
  primary: 'hsl(221.2 83.2% 53.3%)',
  primaryForeground: 'hsl(210 40% 98%)',
  secondary: 'hsl(210 40% 96.1%)',
  secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
  accent: 'hsl(210 40% 96.1%)',
  accentForeground: 'hsl(222.2 47.4% 11.2%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  destructiveForeground: 'hsl(210 40% 98%)',
  muted: 'hsl(210 40% 96.1%)',
  mutedForeground: 'hsl(215.4 16.3% 46.9%)',
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(222.2 84% 4.9%)',
  border: 'hsl(214.3 31.8% 91.4%)',
  input: 'hsl(214.3 31.8% 91.4%)',
  ring: 'hsl(221.2 83.2% 53.3%)',
}

// Function to apply theme colors to CSS variables
export function applyTheme(theme: Partial<OrganizationTheme> = {}) {
  const mergedTheme = { ...defaultTheme, ...theme }
  const root = document.documentElement

  Object.entries(mergedTheme).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVar, value)
  })
}

// Function to get theme from organization settings (placeholder for future implementation)
export function getOrganizationTheme(organizationId?: string): Partial<OrganizationTheme> {
  // In the future, this will fetch theme settings from the database
  // For now, return empty object to use default theme
  return {}
}

// CSS class names that adapt to the theme
export const themeClasses = {
  // Primary button styles
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
  // Secondary button styles
  secondaryButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  // Destructive button styles
  destructiveButton: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  // Card styles
  card: 'bg-card text-card-foreground border border-border',
  // Input styles
  input: 'bg-background border-input',
  // Text styles
  mutedText: 'text-muted-foreground',
  // Badge styles
  badge: 'bg-secondary text-secondary-foreground',
}