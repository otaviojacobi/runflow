# @repo/schemas

Shared validation schemas and types for the RunFlow project, used across web and mobile applications.

## Overview

This package provides centralized Zod schemas and TypeScript types for API validation, ensuring consistency across all clients and the backend.

## Installation

This package is automatically available in the monorepo workspace. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@repo/schemas": "*"
  }
}
```

## Usage

### Authentication Schemas

```typescript
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
  type RegisterResponse,
  type LoginResponse,
  type AuthErrorResponse
} from '@repo/schemas/auth'

// Validate registration data
try {
  const validatedData = registerSchema.parse({
    email: 'user@example.com',
    password: 'SecurePass123',
    name: 'John Doe' // optional
  })
  // validatedData is typed as RegisterInput
} catch (error) {
  if (error instanceof ZodError) {
    // Handle validation errors
    console.log(error.errors)
  }
}

// Validate login data
const loginData = loginSchema.parse({
  email: 'user@example.com',
  password: 'anypassword'
})
```

### In API Routes (Next.js)

```typescript
import { registerSchema, type RegisterResponse, type AuthErrorResponse } from '@repo/schemas/auth'
import { ZodError } from 'zod'

export async function POST(request: Request): Promise<Response<RegisterResponse | AuthErrorResponse>> {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Use validatedData.email, validatedData.password, etc.

  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'Validation failed',
          details: error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }
  }
}
```

### In React Native (Mobile)

```typescript
import { registerSchema, type RegisterInput } from '@repo/schemas/auth'

function RegisterScreen() {
  const handleRegister = async (formData: RegisterInput) => {
    // Validate before sending
    try {
      const validatedData = registerSchema.parse(formData)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validatedData)
      })

    } catch (error) {
      if (error instanceof ZodError) {
        // Show validation errors to user
      }
    }
  }
}
```

## Available Schemas

### `registerSchema`

Validates user registration data:
- `email`: Valid email address (required)
- `password`: Min 8 chars, must contain uppercase, lowercase, and number (required)
- `name`: Non-empty string (optional)

### `loginSchema`

Validates user login data:
- `email`: Valid email address (required)
- `password`: Non-empty string (required)

## Types

All schemas export corresponding TypeScript types using `z.infer`:

- `RegisterInput` - Input type for registration
- `LoginInput` - Input type for login
- `RegisterResponse` - Success response from /api/auth/register
- `LoginResponse` - Success response from /api/auth/login
- `AuthErrorResponse` - Error response format

## Adding New Schemas

1. Create a new file in `src/` (e.g., `src/user.ts`)
2. Define your Zod schemas and export types
3. Add the export to `package.json`:

```json
{
  "exports": {
    "./auth": "./src/auth.ts",
    "./user": "./src/user.ts"
  }
}
```

4. Use in your apps:

```typescript
import { mySchema } from '@repo/schemas/user'
```
