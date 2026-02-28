# HealthTrack MVP — Design Architecture & Implementation Guide

> **One-liner:** A personal health report tracker that extracts, stores, trends, and reminds users about their medical checkup data.

---

## 1. The Problem

- People get health checkups but never maintain historical records
- When asked "what was your last sugar level?", most have no answer
- No easy way to compare reports over time or spot worsening trends
- Chronic condition patients (diabetes, thyroid, etc.) especially need longitudinal tracking
- Paper/PDF reports sit in WhatsApp or email — never looked at again

## 2. Core User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | User | Upload my health checkup PDF | My data is digitized and stored |
| 2 | User | See all my parameters on a single dashboard | I know where I stand today |
| 3 | User | View graphs of any parameter over time | I can see trends (improving / worsening) |
| 4 | User | Get a monthly email summary | I'm reminded to check my health & get next checkup |
| 5 | User | Ask questions about my reports | I understand what my numbers mean without Googling |
| 6 | User | Get flagged on abnormal values | I know what needs attention without reading full reports |
| 7 | User | Create profiles for family members | I can track my parents'/spouse's/grandparents' health too |
| 8 | User | Switch between family profiles | I can view each person's dashboard, trends, and chat independently |
| 9 | User | Get a family-wide email digest | One email summarizes everyone's health status and flags |

---

## 3. Feature Breakdown (MVP vs V2)

### MVP (Build This First)
- **Auth & Onboarding** — Email/password + Google OAuth
- **Family Profiles** — Create profiles for self + family members (Mom, Dad, Nani, etc.)
- **PDF Upload & OCR** — Upload report PDF per profile → Mistral OCR extracts structured data
- **Structured Data Storage** — Normalized storage of all biomarkers per profile
- **Dashboard** — Profile-switched view: latest values, status indicators (normal/high/low)
- **Trend Graphs** — Line charts for any parameter across all uploaded reports per profile
- **Living Health Markdown** — LLM-maintained health document per profile, powers all features
- **Smart Summary** — LLM-generated plain-English summary from the LHM
- **Monthly Email Digest** — Automated family-wide email with per-profile trends, flags, and reminders
- **RAG Q&A** — Profile-aware chat: "Is mom's uric acid improving?"

### V2 (Later)
- Shared profile access (sibling can also view mom's profile)
- WhatsApp bot for upload + queries
- Doctor sharing (generate a shareable link for your doctor)
- Medication tracking tied to reports
- Reminders for next checkup based on report frequency patterns
- Regional lab format fine-tuning (Indian labs like Thyrocare, SRL, Dr Lal PathLabs)
- Mobile app (React Native / Flutter)

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                  Next.js (App Router)                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│   │ Dashboard │  │  Upload  │  │  Trends  │  │  Q&A Chat │  │
│   └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST / tRPC
┌─────────────────────▼───────────────────────────────────────┐
│                      BACKEND API                            │
│                  Next.js API Routes                      │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Auth Module  │  │ Report Proc. │  │  Q&A / RAG Engine  │  │
│  │ (supabase auth)      │  │              │  │                    │  │
│  └─────────────┘  └──────┬───────┘  └────────┬───────────┘  │
└──────────────────────────┼────────────────────┼─────────────┘
                           │                    │
          ┌────────────────▼──┐     ┌───────────▼──────────┐
          │  MISTRAL OCR API  │     │  MISTRAL LLM (Chat)  │
          │  (PDF → Markdown) │     │  (Summaries, Q&A)    │
          └────────────────┬──┘     └───────────┬──────────┘
                           │                    │
                    ┌──────▼────────────────────▼──────┐
                    │         DATA LAYER               │
                    │                                  │
                    │  ┌───────────┐  ┌─────────────┐  │
                    │  │ PostgreSQL│  │  Vector DB   │  │
                    │  │ (Supabase)│  │ (pgvector /  │  │
                    │  │           │  │  Qdrant)     │  │
                    │  └───────────┘  └─────────────┘  │
                    │                                  │
                    │  ┌───────────┐  ┌─────────────┐  │
                    │  │  supabase
                          storage  │  │   job queue │  │
                    │  │           │  │   (redis)   │  │
                    │  └───────────┘  └─────────────┘  │
                    └──────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      CRON / SCHEDULER     │
                    │   Monthly email digest    │
                    │  (Resend + Cron trigger)  │
                    └───────────────────────────┘
```

---

## 5. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14+ (App Router) + Tailwind + shadcn/ui | Fast to build, SSR for SEO, great DX |
| **Charts** | Recharts or Chart.js | Simple, React-native charting |
| **Auth** | NextAuth.js or Clerk | Google OAuth + email/password, easy setup |
| **Backend API** | Next.js API Routes (or FastAPI if you prefer Python) | Co-located with frontend, or separate Python service for ML-heavy work |
| **OCR** | Mistral OCR API (`mistral-ocr-latest`) | Best-in-class PDF understanding, $1/1000 pages, table extraction |
| **LLM** | Mistral Chat (`mistral-large-latest` or `mistral-small-latest`) | Summaries, Q&A, report analysis — stay in one ecosystem |
| **Database** | PostgreSQL via Supabase | Relational data, free tier, built-in auth option, Row Level Security |
| **Vector Store** | pgvector (Supabase extension) or Qdrant | RAG embeddings for Q&A over report history |
| **File Storage** | Supabase Storage / Cloudflare R2 / AWS S3 | Store original PDFs |
| **Email** | Resend | Excellent DX, React Email templates, generous free tier |
| **Job Queue** | BullMQ + Redis | Async OCR processing, scheduled email digests |
| **Deployment** | Vercel (frontend) + Railway (worker if needed) | Easy deploys, scales automatically |
| **Embeddings** | Mistral Embed (`mistral-embed`) | Keep everything in one API ecosystem |

---

## 6. Database Schema (PostgreSQL)

```sql
-- Users (one per login)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Family profiles (one user can have many profiles)
-- Each profile = one person's health data (self, mom, dad, nani, etc.)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- "Mom", "Dad", "Nani", or user's own name
  relationship TEXT NOT NULL DEFAULT 'self',  -- "self" | "mother" | "father" | "spouse" | "grandmother" | "grandfather" | "other"
  dob DATE,
  gender TEXT,
  is_default BOOLEAN DEFAULT false,     -- true for the user's own profile
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded reports (one row per PDF, tied to a profile)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,               -- S3/R2 URL
  report_date DATE,                     -- user-entered → OCR-extracted → null
  raw_ocr_markdown TEXT,                -- full Mistral OCR output
  processing_status TEXT DEFAULT 'pending',  -- pending | processing | done | failed
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Biomarker values extracted from reports (used for graphs/charts only)
-- Reference ranges are NOT stored here — they live in a central
-- biomarker_definitions table so they're consistent across all users
CREATE TABLE biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- "Fasting Blood Sugar" (as seen in report)
  name_normalized TEXT NOT NULL,        -- "fasting_blood_sugar" (canonical key)
  category TEXT,                        -- "Diabetes", "Liver", "Kidney", "Lipid", "Thyroid"
  value NUMERIC,
  unit TEXT,                            -- "mg/dL", "U/L", etc.
  report_date DATE,                     -- copied from parent report
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Central reference ranges — single source of truth for all users
-- Maintained by us, not extracted from reports
CREATE TABLE biomarker_definitions (
  name_normalized TEXT PRIMARY KEY,     -- "fasting_blood_sugar"
  display_name TEXT NOT NULL,           -- "Fasting Blood Sugar"
  category TEXT NOT NULL,               -- "Diabetes"
  unit TEXT NOT NULL,                   -- "mg/dL"
  ref_range_low NUMERIC,
  ref_range_high NUMERIC,
  critical_low NUMERIC,                 -- optional: severe thresholds
  critical_high NUMERIC,
  description TEXT                      -- short explainer for UI tooltips
);

-- Living Health Markdown (LHM) — one per PROFILE, single source of truth
CREATE TABLE user_health_markdown (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  markdown TEXT NOT NULL,
  version INT DEFAULT 1,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  last_report_date DATE,
  tokens_approx INT
);

-- For RAG: chunked embeddings of report content (fallback for specific queries)
CREATE TABLE report_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1024),               -- Mistral embed dimension
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email notification preferences & log
CREATE TABLE notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  email_digest_enabled BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'monthly',  -- monthly | quarterly
  last_sent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_biomarkers_profile_name ON biomarkers(profile_id, name_normalized);
CREATE INDEX idx_biomarkers_profile_date ON biomarkers(profile_id, report_date);
CREATE INDEX idx_reports_profile ON reports(profile_id);
CREATE INDEX idx_reports_user ON reports(user_id);
```

---

## 7. Core Flows (Step by Step)

### Flow 1: User Signup & Profile Creation

```
User signs up (email/Google OAuth)
       │
       ▼
[1] Create users row
       │
       ▼
[2] Prompt: "Who are you tracking health for?"
    - Pre-filled: "Myself" (mandatory, becomes default profile)
    - Optional: "Add family member" → name + relationship + dob + gender
    - User can add Mom, Dad, Nani, etc. right away (or later from settings)
       │
       ▼
[3] Create profiles rows:
    - Profile 1: { name: "Rahul", relationship: "self", is_default: true }
    - Profile 2: { name: "Mom", relationship: "mother" }
    - Profile 3: { name: "Papa", relationship: "father" }
       │
       ▼
[4] Initialize skeleton LHM for each profile
       │
       ▼
[5] Land on dashboard with default (self) profile selected
```

### Flow 2: PDF Upload & Processing Pipeline

```
User selects a profile (e.g., "Mom") and uploads PDF
       │
       ▼
[1] Frontend: profile picker + file upload + optional date picker
    ("When was this test done?" — skip to extract from report)
       │
       ▼
[2] API stores PDF in S3/R2, creates reports row
    (with user_id + profile_id + report_date if provided)
       │
       ▼
[3] Enqueue background job (BullMQ / edge function)
       │
       ▼
[4] Worker: Call Mistral OCR API
    - Input: PDF URL or base64
    - Output: Markdown with tables
       │
       ▼
[5] Worker: Call Mistral LLM with structured output prompt
    - Input: OCR markdown
    - System prompt: "Extract all biomarkers as JSON array.
      Each item: { name, value, unit, category }"
    - Also extract: report_date (if not provided by user)
       │
       ▼
[6] Worker: Normalize biomarker names
    - Rule-based mapping: "FBS" → "fasting_blood_sugar",
      "S. Uric Acid" → "uric_acid", etc.
    - Maintain a lookup table of aliases → canonical names
       │
       ▼
[7] Worker: Store biomarkers in DB (with profile_id), update report status
       │
       ▼
[8] Worker: Update this PROFILE's LHM
    - Fetch current LHM for profile_id
    - Merge new biomarker data via LLM prompt
    - Compute status by joining against biomarker_definitions
    - Save updated LHM
       │
       ▼
[9] Worker: Generate embeddings for RAG (with profile_id)
       │
       ▼
[10] Notify frontend → "Mom's report processed!"
```

### Flow 3: Dashboard View

```
User opens dashboard → profile switcher at top
       │
       ▼
[1] Default: show user's own profile (is_default = true)
    Tabs/dropdown: [Me] [Mom] [Dad] [Nani] [+ Add Family]
       │
       ▼
[2] On profile select → fetch that profile's LHM
       │
       ▼
[3] API: Fetch user_health_markdown WHERE profile_id = $1
    + Join biomarker_definitions for ref ranges and status computation
       │
       ▼
[4] Frontend renders:
    - Profile name + relationship badge at top ("Mom — Mother")
    - Status cards: each biomarker with value, unit, status badge
    - Color coding: green (normal), amber (borderline), red (high/low)
    - LHM summary / key observations section
    - "Days since last checkup" counter for this profile
```

### Flow 4: Trend Graphs

```
User selects a profile, clicks on a biomarker (e.g., "Mom → Fasting Blood Sugar")
       │
       ▼
[1] API: Fetch all values for that biomarker across time for this profile
    - SELECT b.value, b.report_date, bd.ref_range_low, bd.ref_range_high
      FROM biomarkers b
      JOIN biomarker_definitions bd ON b.name_normalized = bd.name_normalized
      WHERE b.profile_id = $1 AND b.name_normalized = 'fasting_blood_sugar'
      ORDER BY b.report_date ASC
       │
       ▼
[2] Frontend renders line chart:
    - X-axis: report dates
    - Y-axis: values
    - Shaded band: normal reference range (from biomarker_definitions)
    - Points colored by status
```

### Flow 5: Monthly Email Digest (Family-Wide)

```
CRON job triggers (1st of every month)
       │
       ▼
[1] Query all users with email_digest_enabled = true
       │
       ▼
[2] For each user:
    a. Fetch ALL profiles for this user
    b. For each profile: fetch its LHM
    c. Calculate "days since last report" per profile
       │
       ▼
[3] Call Mistral LLM with all profiles' LHMs:
    - "Generate a family health summary email. The user manages
      these profiles:
      
      PROFILE 1 — Rahul (Self):
      {self_lhm}
      
      PROFILE 2 — Mom (Mother):
      {mom_lhm}
      
      PROFILE 3 — Papa (Father):
      {dad_lhm}
      
      Write a warm email with:
      - Quick family overview (who needs attention)
      - Per-person section: flags, improvements, checkup status
      - Prioritize by severity (most concerning person first)
      - Gentle reminders for overdue checkups"
       │
       ▼
[4] Send via Resend with React Email template
    - Subject: "Your Family Health Summary — February 📊"
    - Sections per profile with clear headers
```

### Flow 6: RAG-Powered Q&A (Profile-Aware)

```
User asks: "Is mom's uric acid getting better?"
       │
       ▼
[1] Detect which profile the question is about:
    - Keyword matching: "mom" → find profile with relationship = "mother"
    - If ambiguous or no profile mentioned → use currently selected profile
    - If cross-profile ("compare mom and dad's sugar") → load multiple LHMs
       │
       ▼
[2] Fetch the target profile's LHM as primary context
       │
       ▼
[3] Optionally: vector search against that profile's report_embeddings
    for specific details not in the LHM
       │
       ▼
[4] Build prompt for Mistral LLM:
    - System: "You are a health report assistant. The user is asking
      about {profile_name}'s ({relationship}) health.
      Here is their health profile:
      {profile_lhm}
      Answer based on this data. Cite specific values and dates.
      Never diagnose — suggest consulting a doctor for medical advice."
    - User question
       │
       ▼
[5] Stream response to frontend chat UI
```

---

## 8. Biomarker Normalization Strategy

This is **critical** — different labs use different names for the same test. You need a mapping layer.

```python
# biomarker_aliases.py — maintain and expand over time

BIOMARKER_MAP = {
    # Diabetes
    "fasting_blood_sugar": [
        "fasting blood sugar", "fbs", "fasting glucose",
        "fasting blood glucose", "glucose fasting"
    ],
    "hba1c": [
        "hba1c", "glycated hemoglobin", "glycosylated hemoglobin",
        "hemoglobin a1c", "a1c"
    ],
    "pp_blood_sugar": [
        "pp blood sugar", "ppbs", "post prandial blood sugar",
        "post prandial glucose", "glucose pp"
    ],

    # Kidney
    "uric_acid": [
        "uric acid", "serum uric acid", "s. uric acid", "urate"
    ],
    "creatinine": [
        "creatinine", "serum creatinine", "s. creatinine"
    ],
    "bun": [
        "bun", "blood urea nitrogen", "urea"
    ],

    # Lipid
    "total_cholesterol": [
        "total cholesterol", "cholesterol total", "cholesterol"
    ],
    "hdl": ["hdl", "hdl cholesterol", "hdl-c"],
    "ldl": ["ldl", "ldl cholesterol", "ldl-c"],
    "triglycerides": ["triglycerides", "tg", "trigs"],

    # Thyroid
    "tsh": ["tsh", "thyroid stimulating hormone"],
    "t3": ["t3", "total t3", "triiodothyronine"],
    "t4": ["t4", "total t4", "thyroxine"],

    # Liver
    "sgot": ["sgot", "ast", "aspartate aminotransferase"],
    "sgpt": ["alt", "sgpt", "alanine aminotransferase"],

    # Blood Count
    "hemoglobin": ["hemoglobin", "hb", "haemoglobin"],
    "wbc": ["wbc", "white blood cells", "total wbc count", "tlc"],
    "platelet_count": ["platelet count", "platelets"],

    # ... expand as you encounter more lab formats
}

def normalize_name(raw_name: str) -> str:
    """Match raw OCR-extracted name to canonical biomarker key."""
    raw = raw_name.strip().lower()
    for canonical, aliases in BIOMARKER_MAP.items():
        if raw in aliases:
            return canonical
    return raw.replace(" ", "_")  # fallback: slugify as-is
```

**Tip:** Use Mistral LLM as a fallback normalizer for names not in the map — prompt it with the raw name + context and ask it to map to the closest canonical name.

---

## 9. Key API Endpoints

```
POST   /api/auth/signup              — Register
POST   /api/auth/login               — Login
GET    /api/auth/session             — Current user

GET    /api/profiles                 — List user's family profiles
POST   /api/profiles                 — Create a new family profile
PUT    /api/profiles/:id             — Update profile (name, dob, etc.)
DELETE /api/profiles/:id             — Delete profile + all its data

POST   /api/reports/upload           — Upload PDF (multipart, includes profile_id)
GET    /api/reports?profile_id=      — List reports for a profile
GET    /api/reports/:id              — Report detail + biomarkers
DELETE /api/reports/:id              — Delete a report

GET    /api/dashboard?profile_id=    — LHM + latest biomarkers for a profile
GET    /api/biomarkers/:name/trend?profile_id=  — Time series for a profile's biomarker

POST   /api/chat                     — RAG Q&A (profile auto-detected from query or explicit)

GET    /api/settings/notifications   — Get notification prefs
PUT    /api/settings/notifications   — Update notification prefs
```

---

## 10. LLM Prompt Templates

### Biomarker Extraction Prompt (post-OCR)
```
You are a medical report parser. Given the following OCR text from a
health checkup report, extract ALL biomarkers/test results as a JSON array.

For each biomarker return:
{
  "name": "exact name as shown in report",
  "value": <numeric value>,
  "unit": "unit of measurement",
  "category": "one of: Diabetes, Kidney, Liver, Lipid, Thyroid, Blood Count, Vitamin, Other"
}

Also extract:
- "report_date": date of the test (YYYY-MM-DD) if visible in the report

Return ONLY valid JSON, no explanation.

--- OCR TEXT ---
{ocr_markdown}
```

### Monthly Family Summary Prompt
```
You are a friendly health assistant writing a monthly email summary
for a family.

The user manages health tracking for these family members:

{for each profile}
PROFILE: {name} ({relationship})
{profile_lhm}
{end for}

Write a warm, concise family health email (4-6 paragraphs):
1. Family overview — who needs attention, who is doing well
2. Per-person highlights (most concerning person first):
   - Flagged values with simple explanations
   - Improvements worth celebrating
   - Days since last checkup, reminder if overdue (> 90 days)
3. Closing with encouragement

Tone: caring but not alarming. Do not diagnose. Suggest consulting
a doctor for any abnormal values.
```

---


---

## 12. Cost Estimation (MVP Scale)

| Service | Free Tier | Estimated Monthly (100 users) |
|---------|-----------|-------------------------------|
| Vercel | 100GB bandwidth | $0 |
| Supabase | 500MB DB, 1GB storage | $0 (free tier) |
| Mistral OCR | $1/1000 pages | ~$0.50 (500 pages/month) |
| Mistral LLM (summaries + Q&A) | Pay per token | ~$5-10 |
| Mistral Embed | Pay per token | ~$1-2 |
| Resend | 3000 emails/month free | $0 |
| Cloudflare R2 | 10GB free | $0 |
| **Total** | | **~$7-13/month** |

Very lean. You can run this MVP almost free for early users.

