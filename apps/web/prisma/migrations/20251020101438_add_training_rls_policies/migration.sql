-- Enable RLS for training-related tables
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_done_details ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Trainings Policies
-- ========================================

-- Members can view their assigned trainings OR trainers/owners can view trainings in their org
CREATE POLICY "Users can view relevant trainings"
ON trainings FOR SELECT
USING (
  -- Members can view trainings assigned to them
  (member_id = (SELECT auth.uid())::text)
  OR
  -- Trainers/owners can view trainings in their organizations
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = trainings.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
);

-- Only trainers/owners can create trainings for members in their org
CREATE POLICY "Trainers and owners can create trainings"
ON trainings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = trainings.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
  AND trainer_id = (SELECT auth.uid())::text
  -- Ensure the member exists in the same organization
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = trainings.organization_id
    AND organization_members.user_id = trainings.member_id
  )
);

-- Trainers/owners can update their own trainings, members can update status
CREATE POLICY "Users can update trainings"
ON trainings FOR UPDATE
USING (
  -- Trainers/owners can update their own trainings
  (trainer_id = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = trainings.organization_id
      AND organization_members.user_id = (SELECT auth.uid())::text
      AND organization_members.role IN ('OWNER', 'TRAINER')
    )
  )
  OR
  -- Members can update their assigned trainings (for status changes)
  (member_id = (SELECT auth.uid())::text)
);

-- Only trainers/owners can delete trainings they created
CREATE POLICY "Trainers and owners can delete their trainings"
ON trainings FOR DELETE
USING (
  trainer_id = (SELECT auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.organization_id = trainings.organization_id
    AND organization_members.user_id = (SELECT auth.uid())::text
    AND organization_members.role IN ('OWNER', 'TRAINER')
  )
);

-- ========================================
-- Training Done Details Policies
-- ========================================

-- Users can view completion details if they can view the training
CREATE POLICY "Users can view training done details"
ON training_done_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trainings
    WHERE trainings.id = training_done_details.training_id
    AND (
      trainings.member_id = (SELECT auth.uid())::text
      OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = trainings.organization_id
        AND organization_members.user_id = (SELECT auth.uid())::text
        AND organization_members.role IN ('OWNER', 'TRAINER')
      )
    )
  )
);

-- Only members can create completion details for their own trainings
CREATE POLICY "Members can create their training done details"
ON training_done_details FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM trainings
    WHERE trainings.id = training_done_details.training_id
    AND trainings.member_id = (SELECT auth.uid())::text
  )
);

-- Only members can update their own completion details
CREATE POLICY "Members can update their training done details"
ON training_done_details FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM trainings
    WHERE trainings.id = training_done_details.training_id
    AND trainings.member_id = (SELECT auth.uid())::text
  )
);

-- Only members can delete their own completion details
CREATE POLICY "Members can delete their training done details"
ON training_done_details FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM trainings
    WHERE trainings.id = training_done_details.training_id
    AND trainings.member_id = (SELECT auth.uid())::text
  )
);
