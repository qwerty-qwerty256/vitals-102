-- Enable Row Level Security on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_markdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE lhm_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only view and update their own user record
CREATE POLICY "Users can view own record" 
  ON users FOR SELECT 
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own record" 
  ON users FOR UPDATE 
  USING (auth.uid() = supabase_user_id);

-- Profiles table policies
-- Users can only access profiles they own
CREATE POLICY "Users can view own profiles" 
  ON profiles FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own profiles" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own profiles" 
  ON profiles FOR DELETE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- Reports table policies
-- Users can only access reports for their own profiles
CREATE POLICY "Users can view own reports" 
  ON reports FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own reports" 
  ON reports FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own reports" 
  ON reports FOR UPDATE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own reports" 
  ON reports FOR DELETE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- Biomarkers table policies
-- Users can only access biomarkers from their own profiles
CREATE POLICY "Users can view own biomarkers" 
  ON biomarkers FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own biomarkers" 
  ON biomarkers FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own biomarkers" 
  ON biomarkers FOR UPDATE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own biomarkers" 
  ON biomarkers FOR DELETE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- User Health Markdown table policies
-- Users can only access LHM for their own profiles
CREATE POLICY "Users can view own LHM" 
  ON user_health_markdown FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own LHM" 
  ON user_health_markdown FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own LHM" 
  ON user_health_markdown FOR UPDATE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own LHM" 
  ON user_health_markdown FOR DELETE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- LHM History table policies
-- Users can only access LHM history for their own profiles
CREATE POLICY "Users can view own LHM history" 
  ON lhm_history FOR SELECT 
  USING (auth.uid() = (
    SELECT u.supabase_user_id 
    FROM users u 
    JOIN profiles p ON p.user_id = u.id 
    WHERE p.id = profile_id
  ));

CREATE POLICY "Users can insert own LHM history" 
  ON lhm_history FOR INSERT 
  WITH CHECK (auth.uid() = (
    SELECT u.supabase_user_id 
    FROM users u 
    JOIN profiles p ON p.user_id = u.id 
    WHERE p.id = profile_id
  ));

-- Report Embeddings table policies
-- Users can only access embeddings from their own reports
CREATE POLICY "Users can view own embeddings" 
  ON report_embeddings FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own embeddings" 
  ON report_embeddings FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own embeddings" 
  ON report_embeddings FOR DELETE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- Notification Preferences table policies
-- Users can only access their own notification preferences
CREATE POLICY "Users can view own notification prefs" 
  ON notification_prefs FOR SELECT 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own notification prefs" 
  ON notification_prefs FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own notification prefs" 
  ON notification_prefs FOR UPDATE 
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- Biomarker Definitions table - read-only for all authenticated users
-- No RLS needed as this is reference data, but we can add a policy for clarity
ALTER TABLE biomarker_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view biomarker definitions" 
  ON biomarker_definitions FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Service role bypass
-- The service role (used by backend) bypasses RLS automatically
-- This allows the backend to perform operations on behalf of users

-- Comments for documentation
COMMENT ON POLICY "Users can view own profiles" ON profiles IS 'Users can only view profiles they own';
COMMENT ON POLICY "Users can view own reports" ON reports IS 'Users can only view reports for their profiles';
COMMENT ON POLICY "Users can view own biomarkers" ON biomarkers IS 'Users can only view biomarkers from their profiles';
COMMENT ON POLICY "Users can view own LHM" ON user_health_markdown IS 'Users can only view LHM for their profiles';
COMMENT ON POLICY "Authenticated users can view biomarker definitions" ON biomarker_definitions IS 'All authenticated users can view reference biomarker data';
