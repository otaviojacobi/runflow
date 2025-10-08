import { z } from 'zod'

// Organization Theme schema
export const organizationThemeSchema = z.object({
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  destructive: z.string(),
  destructiveForeground: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
  background: z.string(),
  foreground: z.string(),
  card: z.string(),
  cardForeground: z.string(),
  border: z.string(),
  input: z.string(),
  ring: z.string(),
})

// Types
export type OrganizationTheme = z.infer<typeof organizationThemeSchema>
