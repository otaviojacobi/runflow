# API Module Documentation

The mobile app uses a centralized API module (`lib/api.ts`) for all backend communication. This ensures consistency, proper authentication, and makes the backend URL configurable via environment variables.

## Configuration

### Environment Variable

Set the backend URL in your `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

**Important for Development:**
- **iOS Simulator**: Use `http://localhost:3000` or your computer's IP
- **Android Emulator**: Use `http://10.0.2.2:3000` (maps to host machine)
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

### Authentication

All API requests automatically include:
- `Content-Type: application/json` header
- `Authorization: Bearer <token>` header (when user is authenticated)

The token is automatically retrieved from Supabase session.

## API Methods

### Auth API

#### `api.login(email, password)`
Login with email and password.

```typescript
const result = await api.login('user@example.com', 'password123');
```

#### `api.register(name, email, password, captchaToken?)`
Register a new user account.

```typescript
const result = await api.register('John Doe', 'john@example.com', 'password123');
```

#### `api.logout()`
Logout the current user.

```typescript
await api.logout();
```

#### `api.resendConfirmation(email)`
Resend email confirmation.

```typescript
await api.resendConfirmation('user@example.com');
```

---

### User API

#### `api.getCurrentUser()`
Get current user information.

```typescript
const user = await api.getCurrentUser();
// Returns: { id, name, email, currentOrganizationId }
```

#### `api.getPendingInvites()`
Get pending organization invites for the current user.

```typescript
const invites = await api.getPendingInvites();
// Returns: Array of invite objects with organization details
```

#### `api.switchOrganization(organizationId)`
Switch to a different organization.

```typescript
await api.switchOrganization('org-123');
```

---

### Organizations API

#### `api.getOrganizations()`
Get all organizations the user belongs to.

```typescript
const organizations = await api.getOrganizations();
// Returns: Array of { id, name, description, role, joinedAt }
```

#### `api.getOrganization(organizationId)`
Get details of a specific organization.

```typescript
const org = await api.getOrganization('org-123');
// Returns: { id, name, description, createdAt }
```

#### `api.createOrganization(name, description?)`
Create a new organization.

```typescript
const newOrg = await api.createOrganization('My Team', 'Team description');
```

#### `api.updateOrganization(organizationId, name, description?)`
Update organization details (owner only).

```typescript
await api.updateOrganization('org-123', 'Updated Name', 'New description');
```

#### `api.deleteOrganization(organizationId)`
Delete an organization (owner only).

```typescript
await api.deleteOrganization('org-123');
```

#### `api.getOrganizationTheme(organizationId)`
Get the custom theme for an organization.

```typescript
const theme = await api.getOrganizationTheme('org-123');
// Returns: Partial<OrganizationTheme> with color values
```

---

### Members API

#### `api.getOrganizationMembers(organizationId)`
Get all members of an organization.

```typescript
const { members } = await api.getOrganizationMembers('org-123');
// Returns: { members: Array of member objects with user details }
```

#### `api.removeMember(organizationId, userId)`
Remove a member from the organization.

```typescript
await api.removeMember('org-123', 'user-456');
```

#### `api.updateMemberRole(organizationId, userId, role)`
Update a member's role.

```typescript
await api.updateMemberRole('org-123', 'user-456', 'TRAINER');
// Roles: 'OWNER', 'TRAINER', 'ATHLETE'
```

---

### Invites API

#### `api.getOrganizationInvites(organizationId)`
Get pending invites for an organization.

```typescript
const invites = await api.getOrganizationInvites('org-123');
// Returns: Array of { id, email, role, createdAt, expiresAt }
```

#### `api.createInvite(organizationId, email, role)`
Create a new invitation.

```typescript
await api.createInvite('org-123', 'newuser@example.com', 'ATHLETE');
```

#### `api.revokeInvite(organizationId, inviteId)`
Revoke a pending invitation.

```typescript
await api.revokeInvite('org-123', 'invite-789');
```

#### `api.acceptInvite(token)`
Accept an organization invitation.

```typescript
await api.acceptInvite('invite-token-xyz');
```

#### `api.declineInvite(token)`
Decline an organization invitation.

```typescript
await api.declineInvite('invite-token-xyz');
```

---

### Athletes API

#### `api.getAthletes(organizationId)`
Get all athletes (members with ATHLETE role).

```typescript
const { athletes } = await api.getAthletes('org-123');
// Returns: { athletes: Array of athlete objects }
```

#### `api.inviteAthlete(organizationId, email)`
Invite a new athlete to the organization.

```typescript
await api.inviteAthlete('org-123', 'athlete@example.com');
```

#### `api.removeAthlete(organizationId, userId)`
Remove an athlete from the organization.

```typescript
await api.removeAthlete('org-123', 'user-456');
```

---

## Error Handling

All API methods throw errors when requests fail. Always wrap API calls in try-catch blocks:

```typescript
try {
  const user = await api.getCurrentUser();
  console.log('User:', user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
  Alert.alert('Error', error.message);
}
```

## Usage Example

```typescript
import { api } from '../lib/api';
import { Alert } from 'react-native';

async function fetchUserData() {
  try {
    // Get current user
    const user = await api.getCurrentUser();

    // Get organizations
    const organizations = await api.getOrganizations();

    // Get members of first organization
    if (organizations.length > 0) {
      const { members } = await api.getOrganizationMembers(organizations[0].id);
      console.log('Members:', members);
    }

    // Get pending invites
    const invites = await api.getPendingInvites();
    console.log('Pending invites:', invites);

  } catch (error) {
    Alert.alert('Error', error.message);
  }
}
```

## Type Safety

All API methods are fully typed with TypeScript. Your IDE will provide autocomplete and type checking:

```typescript
// TypeScript knows the return type
const user = await api.getCurrentUser();
// user.id: string
// user.name: string
// user.email: string
// user.currentOrganizationId: string | null
```

## Backend Integration

The API module expects the backend to expose the following endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/resend-confirmation`
- `GET /api/users/me`
- `GET /api/users/me/pending-invites`
- `POST /api/users/switch-organization`
- `GET /api/organizations`
- `POST /api/organizations`
- `GET /api/organizations/:id`
- `PUT /api/organizations/:id`
- `DELETE /api/organizations/:id`
- `GET /api/organizations/:id/theme`
- `GET /api/organizations/:id/members`
- `DELETE /api/organizations/:id/members/:userId`
- `PUT /api/organizations/:id/members/:userId`
- `GET /api/organizations/:id/invites`
- `POST /api/organizations/:id/invites`
- `DELETE /api/organizations/:id/invites/:inviteId`
- `POST /api/invites/:token/accept`
- `DELETE /api/invites/:token`

All endpoints should accept/return JSON and use Bearer token authentication (except auth endpoints).
