-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  supabase_user_id UUID UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Family profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'self',
  dob DATE,
  gender TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  report_date DATE,
  raw_ocr_markdown TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'done', 'failed')),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Biomarker reference definitions
CREATE TABLE biomarker_definitions (
  name_normalized TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  ref_range_low NUMERIC,
  ref_range_high NUMERIC,
  critical_low NUMERIC,
  critical_high NUMERIC,
  description TEXT
);

-- Biomarker values
CREATE TABLE biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL REFERENCES biomarker_definitions(name_normalized),
  category TEXT,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Living Health Markdown
CREATE TABLE user_health_markdown (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  markdown TEXT NOT NULL,
  version INT DEFAULT 1,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  last_report_date DATE,
  tokens_approx INT
);

-- LHM version history
CREATE TABLE lhm_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  markdown TEXT NOT NULL,
  version INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Report embeddings for RAG
CREATE TABLE report_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1024),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences
CREATE TABLE notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_digest_enabled BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'monthly' CHECK (digest_frequency IN ('monthly', 'quarterly')),
  last_sent_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_biomarkers_profile_name ON biomarkers(profile_id, name_normalized);
CREATE INDEX idx_biomarkers_profile_date ON biomarkers(profile_id, report_date DESC);
CREATE INDEX idx_reports_profile ON reports(profile_id);
CREATE INDEX idx_reports_status ON reports(processing_status) WHERE processing_status != 'done';
CREATE INDEX idx_embeddings_profile ON report_embeddings(profile_id);

-- Vector similarity search index (IVFFlat for approximate nearest neighbor search)
CREATE INDEX idx_embeddings_vector ON report_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts synced with Supabase Auth';
COMMENT ON TABLE profiles IS 'Health profiles for users and their family members';
COMMENT ON TABLE reports IS 'Uploaded health checkup PDF reports';
COMMENT ON TABLE biomarkers IS 'Extracted biomarker values from reports';
COMMENT ON TABLE biomarker_definitions IS 'Reference data for biomarker normalization and ranges';
COMMENT ON TABLE user_health_markdown IS 'Living Health Markdown documents per profile';
COMMENT ON TABLE lhm_history IS 'Version history of LHM documents';
COMMENT ON TABLE report_embeddings IS 'Vector embeddings for RAG-powered Q&A';
COMMENT ON TABLE notification_prefs IS 'User notification preferences for email digests';
