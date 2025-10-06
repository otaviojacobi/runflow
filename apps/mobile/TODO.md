# Multi-Organization System Implementation

## Overview
Implement a multi-organization platform where users can belong to multiple organizations with different roles (Owner, Trainer, Athlete). Users can create organizations, be invited to join existing ones, and switch between organizations in the UI.

## Database Schema Changes

**Important:** All new tables MUST have proper Row Level Security (RLS) policies implemented as part of their migration scripts. This ensures data isolation and security at the database level.

### 1. Create Organization Model
- [ ] Create `Organization` table with fields:
  - `id` (UUID)
  - `name` (String)
  - `slug` (String, unique)
  - `description` (Text, optional)
  - `logo` (String, optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- [ ] **Create RLS policies for Organization table:**
  - Enable RLS on table
  - SELECT: Users can view organizations they belong to
  - INSERT: Authenticated users can create organizations
  - UPDATE: Only organization owners can update
  - DELETE: Only organization owners can delete

### 2. Create Organization Membership Model
- [ ] Create `OrganizationMember` table with fields:
  - `id` (UUID)
  - `organizationId` (Foreign Key)
  - `userId` (Foreign Key)
  - `role` (Enum: OWNER, TRAINER, ATHLETE)
  - `joinedAt` (DateTime)
  - `invitedBy` (Foreign Key to User, optional)
- [ ] **Create RLS policies for OrganizationMember table:**
  - Enable RLS on table
  - SELECT: Users can view members of their organizations
  - INSERT: Only organization owners and trainers can add members (via invite acceptance)
  - UPDATE: Only organization owners can update member roles
  - DELETE: Only organization owners can remove members

### 3. Create Organization Invites Model
- [ ] Create `OrganizationInvite` table with fields:
  - `id` (UUID)
  - `organizationId` (Foreign Key)
  - `email` (String)
  - `role` (Enum: TRAINER, ATHLETE)
  - `invitedBy` (Foreign Key to User)
  - `token` (String, unique)
  - `status` (Enum: PENDING, ACCEPTED, EXPIRED, CANCELLED)
  - `expiresAt` (DateTime)
  - `createdAt` (DateTime)
- [ ] **Create RLS policies for OrganizationInvite table:**
  - Enable RLS on table
  - SELECT: Organization owners/trainers can view their org's invites, users can view invites for their email
  - INSERT: Only organization owners and trainers can create invites
  - UPDATE: Invite recipient can accept, owners/trainers can cancel
  - DELETE: Only organization owners can delete invites

### 4. Update User Model
- [ ] Add `currentOrganizationId` field to User table (nullable)
- [ ] Update existing RLS policies to accommodate organization context
- [ ] Create migration scripts for all database changes including RLS policies

## Backend API Endpoints

**Critical Requirement:** All endpoints that INSERT data into the database MUST implement rate limiting to prevent abuse and ensure system stability. Each rate limit should be configurable with sensible defaults.

### Organization Management

#### 1. Organization CRUD Operations
- [ ] `POST /api/organizations` - Create new organization
  - Auto-assign creator as OWNER
  - Generate unique slug from name
  - **Rate Limit Required:** Maximum 3 organizations per user per day (creating orgs is uncommon)
- [ ] `GET /api/organizations` - List user's organizations
- [ ] `GET /api/organizations/:id` - Get organization details
- [ ] `PUT /api/organizations/:id` - Update organization (OWNER only)
  - **Rate Limit Required:** Maximum 10 updates per hour per organization
- [ ] `DELETE /api/organizations/:id` - Delete organization (OWNER only)

#### 2. Organization Member Management
- [ ] `GET /api/organizations/:id/members` - List organization members
  - Filter by role
  - Pagination support
- [ ] `PUT /api/organizations/:id/members/:userId` - Update member role (OWNER only)
  - **Rate Limit Required:** Maximum 20 role updates per hour per organization
- [ ] `DELETE /api/organizations/:id/members/:userId` - Remove member (OWNER only)
  - **Rate Limit Required:** Maximum 10 removals per hour per organization

#### 3. Organization Switching
- [ ] `POST /api/users/switch-organization` - Switch current organization
  - Update `currentOrganizationId` in User model
  - Return updated user context
  - **Rate Limit Required:** Maximum 30 switches per hour per user (flexible for testing/development)

### Invitation System

#### 4. Invite Management
- [ ] `POST /api/organizations/:id/invites` - Create invitation (OWNER/TRAINER only)
  - Generate unique token
  - Send invitation email
  - Set expiration (7 days default)
  - **Rate Limit Required:** Maximum 5000 invites per day per organization (very permissive - bulk invites common)
  - **Additional Rate Limit:** Maximum 500 invites per hour per organization (support bulk operations)
- [ ] `GET /api/organizations/:id/invites` - List pending invites
- [ ] `DELETE /api/organizations/:id/invites/:inviteId` - Cancel invitation
  - **Rate Limit Required:** Maximum 20 cancellations per hour per organization
- [ ] `POST /api/invites/:token/accept` - Accept invitation (authenticated)
  - **Rate Limit Required:** Maximum 10 acceptance attempts per hour per user (prevent brute force)
- [ ] `GET /api/invites/:token` - Get invite details (public)

### User Context
#### 5. User Profile Updates
- [ ] Update `GET /api/users/me` to include:
  - Current organization details
  - List of organizations with roles
- [ ] Add organization context to auth token/session

## Frontend Implementation

### Post-Registration Flow

#### 1. Organization Setup Screen
- [ ] Create `OrganizationSetup` screen with options:
  - Create new organization
  - Join existing organization (if have invite code)
  - Skip for now
- [ ] Organization creation form:
  - Organization name
  - Organization type/description
  - Logo upload (optional)

#### 2. Invite Code Entry Screen
- [ ] Create `JoinOrganization` screen
  - Input field for invite code/link
  - Validate and display organization details
  - Accept/Decline buttons

### Organization Management UI

#### 3. Organization Switcher Component
- [ ] Create `OrganizationSwitcher` component in header/navigation
  - Display current organization name/logo
  - Dropdown with list of user's organizations
  - "Create New Organization" option
  - Visual indicator for current selection

#### 4. Organization Settings Screens
- [ ] `OrganizationSettings` screen (OWNER only)
  - Edit organization details
  - View member list
  - Manage roles
- [ ] `MemberManagement` screen
  - List members by role
  - Invite new members
  - Remove members (OWNER only)
  - Edit member roles (OWNER only)

#### 5. Invitation Management Screens
- [ ] `InviteMembers` screen
  - Email input (multiple)
  - Role selection
  - Send invitations
- [ ] `PendingInvites` screen
  - List pending invitations
  - Cancel invitations
  - Resend invitation emails

### State Management

#### 6. Organization Context/Store
- [ ] Create organization context/store
  - Current organization state
  - Organizations list
  - Switch organization action
  - Refresh organizations action
- [ ] Update auth context to include organization data
- [ ] Add organization middleware for API calls

## Email Templates

### 7. Invitation Emails
- [ ] Create invitation email template
  - Organization name and inviter details
  - Role being offered
  - Accept invitation link
  - Expiration notice

## Testing

### 8. Unit Tests
- [ ] Test organization CRUD operations
- [ ] Test membership management
- [ ] Test invitation flow
- [ ] Test role-based permissions

### 9. Integration Tests
- [ ] Test complete invitation flow
- [ ] Test organization switching
- [ ] Test multi-org user scenarios
- [ ] Test permission boundaries

## Security & Permissions

### 10. Authorization Rules
- [ ] Implement role-based access control:
  - OWNER: Full organization control
  - TRAINER: Can invite athletes, view all profiles
  - ATHLETE: Basic access, own profile only
- [ ] Add organization context to all protected routes
- [ ] Validate organization membership for API access

## Rate Limiting Implementation

### 11. Rate Limiting System
- [ ] Implement rate limiting middleware/service
- [ ] Configure rate limits for all data insertion endpoints:
  - **Organization Creation**: 3 per day per user (very restrictive)
  - **Invitation Creation**: 5000 per day per org, 500 per hour per org (very permissive for bulk invites)
  - **Member Management**: 20 updates/10 removals per hour per org
  - **Organization Updates**: 10 per hour per org
  - **Invite Acceptance**: 10 attempts per hour per user
  - **Organization Switching**: 30 per hour per user
- [ ] Store rate limit configuration in environment variables
- [ ] Implement rate limit headers in API responses (X-RateLimit-*)
- [ ] Create monitoring/alerting for rate limit violations
- [ ] Document rate limits in API documentation

## Migration & Deployment

### 12. Data Migration
- [ ] Create migration script for existing users
  - Create default organization for existing users
  - Assign appropriate roles
- [ ] Test migration on staging environment

### 13. Documentation
- [ ] API documentation for new endpoints
- [ ] User guide for organization features
- [ ] Admin guide for organization management

## Future Enhancements (Phase 2)
- [ ] Organization branding customization
- [ ] Billing per organization
- [ ] Organization-level analytics
- [ ] Public organization profiles
- [ ] Organization templates
- [ ] Bulk invite via CSV
- [ ] SSO integration per organization