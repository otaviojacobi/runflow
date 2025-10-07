# RunFlow TODO

## Recent Additions ✅

### Web UI Pages (Completed)
- ✅ `/dashboard/organizations/invite` - Invite users to organizations
- ✅ `/dashboard/profile` - User profile management (converted to client component)
- ✅ `/dashboard/settings` - Application settings
- ✅ `/dashboard/athletes` - Athlete management
- ✅ `/dashboard/athletes/invite` - Invite athletes to organization

### Translations (Completed)
- ✅ **All pages now have complete Portuguese translations**
- ✅ Dashboard page fully translated (all quick actions, tabs, and overview sections)
- ✅ Fixed missing `Navigation.backToHome` translation
- ✅ Added translations for:
  - Dashboard (complete with quickActions, tabs, and overview sections)
  - Organizations.Invite
  - Profile (enhanced)
  - Settings (all sections)
  - Athletes (all sections)
  - DashboardNav (already had translations)

## Known Issues

### Type Errors in Tests
- Test files have TypeScript errors related to Supabase types
- Location: `apps/web/__tests__/api/organizations/organizations.test.ts`
- Issues:
  - `session` property access on union types
  - Objects possibly undefined
- **Action needed**: Fix test type assertions

### Missing API Endpoints
The following pages have UI but need backend implementation:

1. **Organization Invites API** (`/api/organizations/[id]/invites`)
   - POST endpoint to send invitations
   - Needs email sending integration
   - Generate and store invite codes

2. **Profile Update API** (`/api/user/profile`)
   - PUT endpoint to update user metadata
   - Update user name and other profile fields

3. **Settings API** (`/api/user/settings`)
   - GET/PUT endpoints for user preferences
   - Store notification preferences
   - Language preferences (currently handled client-side)

4. **Athletes Management API**
   - GET `/api/organizations/[id]/athletes` - List athletes
   - DELETE `/api/organizations/[id]/athletes/[athleteId]` - Remove athlete
   - Currently using mock data

## Next Steps

### High Priority
1. **Implement API Endpoints**
   - Create organization invites API with email integration
   - Add user profile update endpoint
   - Implement athletes listing and management API

2. **Fix Test Type Errors**
   - Update test files to handle Supabase type unions properly
   - Add proper null checks for test assertions

3. **Add Member List Functionality**
   - Implement actual member listing in Organizations page
   - Connect to database for real member data
   - Add member management actions (edit role, remove)

### Medium Priority
4. **Email Integration**
   - Set up email service (SendGrid, Resend, etc.)
   - Create email templates for invitations
   - Implement email verification flow

5. **Athletes Progress Tracking**
   - Create training session tracking
   - Add progress visualization
   - Implement athlete statistics

6. **Settings Persistence**
   - Store user settings in database
   - Implement dark mode
   - Add more preference options

### Low Priority
7. **Missing Pages** (referenced but not critical)
   - `/dashboard/training` - Training programs
   - `/dashboard/training/new` - Create training program
   - `/dashboard/schedule` - Training schedule
   - `/dashboard/analytics` - Analytics dashboard
   - `/dashboard/progress` - Progress tracking
   - `/dashboard/achievements` - Achievement system

8. **UI Enhancements**
   - Add loading states for all pages
   - Implement error boundaries
   - Add toast notifications for all actions
   - Improve responsive design for mobile

## Database Schema Needed

### Invitations Table
```sql
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'TRAINER', 'ATHLETE')),
  invite_code TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Settings Table
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Training Sessions Table
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES organization_memberships(id),
  organization_id UUID REFERENCES organizations(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Notes

- All new pages include both English and Portuguese translations
- UI components use shadcn/ui for consistency
- All pages check for organization context before rendering
- Responsive design implemented for mobile and desktop
- Dark mode support prepared (theme toggle in settings)

## Recent Fixes (Latest Session) ✅

### Missing Dependencies
- ✅ Installed `sonner` package for toast notifications
- ✅ Added shadcn/ui components:
  - `select` - For dropdown selections
  - `table` - For data tables (athletes list)
  - `switch` - For toggle switches (settings)

### Layout Updates
- ✅ Added `Toaster` component to dashboard layout
- ✅ All pages now compile successfully
- ✅ Build passes with only linting warnings (no errors)

### Verified Working Pages
All pages now build and compile successfully:
- ✅ `/dashboard` - Main dashboard (fully translated)
- ✅ `/dashboard/athletes` - Athletes management
- ✅ `/dashboard/athletes/invite` - Invite athletes
- ✅ `/dashboard/organizations/invite` - Invite organization members
- ✅ `/dashboard/profile` - User profile
- ✅ `/dashboard/settings` - Application settings

## Progress Summary

**Pages Created**: 5/5 ✅
**Translations**: Complete ✅
**Build Status**: Passing ✅
**API Integration**: 0/4 ⏳
**Database Schema**: 0/3 ⏳
**Test Fixes**: 0/1 ⏳
