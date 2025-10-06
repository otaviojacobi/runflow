-- Enable RLS for all organization-related tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- ========================================
-- User Profiles Policies
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (((SELECT auth.uid())::text = id));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (((SELECT auth.uid())::text = id));

-- ========================================
-- Organizations Policies
-- ========================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = (SELECT auth.uid())::text
  )
);

-- Authenticated users can create organizations
CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Only organization owners can update
CREATE POLICY "Organization owners can update"
ON organizations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role = 'OWNER'
  )
);

-- Only organization owners can delete
CREATE POLICY "Organization owners can delete"
ON organizations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role = 'OWNER'
  )
);

-- ========================================
-- Organization Members Policies
-- ========================================

-- Users can view members of their organizations
CREATE POLICY "Users can view members of their organizations"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = (SELECT auth.uid())::text
  )
);

-- System can insert members (when accepting invites or creating org)
CREATE POLICY "System can insert members"
ON organization_members FOR INSERT
WITH CHECK (
  -- Owner creating org (they become owner)
  ((SELECT auth.uid())::text = user_id AND role = 'OWNER')
  OR
  -- User accepting invite
  EXISTS (
    SELECT 1 FROM organization_invites
    WHERE organization_invites.organization_id = organization_members.organization_id
    AND organization_invites.email = (
      SELECT email FROM user_profiles WHERE id = organization_members.user_id
    )
    AND organization_invites.status = 'PENDING'
  )
);

-- Only organization owners can update member roles
CREATE POLICY "Organization owners can update member roles"
ON organization_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = (SELECT auth.uid())::text
    AND om.role = 'OWNER'
  )
);

-- Only organization owners can remove members (or users can remove themselves)
CREATE POLICY "Organization owners can remove members"
ON organization_members FOR DELETE
USING (
  -- Owners can remove members
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = (SELECT auth.uid())::text
    AND om.role = 'OWNER'
  )
  OR
  -- Users can remove themselves
  (user_id = (SELECT auth.uid())::text)
);

-- ========================================
-- Organization Invites Policies
-- ========================================

-- Organization owners/trainers can view their org's invites OR users can view invites for their email
CREATE POLICY "Organization members can view their org invites"
ON organization_invites FOR SELECT
USING (
  -- Members can view their org's invites
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organization_invites.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
  OR
  -- Users can view invites for their email
  email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid())::text)
);

-- Only organization owners and trainers can create invites
CREATE POLICY "Organization owners and trainers can create invites"
ON organization_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organization_invites.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
  AND invited_by_id = (SELECT auth.uid())::text
);

-- Invite recipient can accept, owners/trainers can cancel
CREATE POLICY "Users can update invite status"
ON organization_invites FOR UPDATE
USING (
  -- Recipient can accept
  (email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid())::text) AND status = 'PENDING')
  OR
  -- Owners/trainers can cancel
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organization_invites.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
);

-- Only organization owners can delete invites
CREATE POLICY "Organization owners can delete invites"
ON organization_invites FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = organization_invites.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role = 'OWNER'
  )
);