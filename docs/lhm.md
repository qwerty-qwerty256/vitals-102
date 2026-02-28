# Living Health Markdown (LHM) — Design Spec

> A continuously evolving, LLM-maintained markdown document **per profile** that serves as the single source of truth for that person's health. Each family member gets their own LHM. It powers the chat, dashboard, email digests, and all AI-generated insights.

---

## 1. What Is The LHM?

The Living Health Markdown is a **structured markdown file** stored per **profile** (not per user — a user managing 4 family members has 4 separate LHMs) that:

- Gets **initialized** when the user first signs up (near-empty template)
- Gets **enriched** on first report upload (LLM fills in data from the report)
- Gets **updated incrementally** every time a new report is uploaded (LLM merges new data into existing markdown, preserving history)
- Is the **primary context** fed to the LLM for chat Q&A, summaries, and email digests
- Has a **fixed schema** that we define (the LLM fills in content, but the structure is ours)

Think of it as a **living medical chart** — like what a doctor maintains, but auto-generated and always current.

---

## 2. LHM Template (Our Defined Format)

```markdown
# Health Report — {user_name}

**Last Updated:** {date}
**Reports on File:** {count}
**Last Checkup:** {date} at {lab_name}
**Next Checkup Recommended:** {date or "Overdue by X days"}

---

## Patient Profile
- **Age:** {age}
- **Gender:** {gender}
- **Blood Group:** {blood_group or "Not available"}
- **Known Conditions:** {e.g., "Type 2 Diabetes (diagnosed ~2019), Hypertension"}
- **Medications:** {if disclosed, e.g., "Metformin 500mg, Amlodipine 5mg"}
- **Allergies:** {if known}

---

## Current Health Snapshot (as of {latest_report_date})

### 🔴 Needs Attention
| Parameter | Value | Unit | Ref Range | Status | Trend |
|-----------|-------|------|-----------|--------|-------|
| Fasting Blood Sugar | 145 | mg/dL | 70-110 | HIGH | ↑ Worsening |
| Uric Acid | 8.2 | mg/dL | 3.5-7.0 | HIGH | → Stable |
| HbA1c | 7.8 | % | 4.0-5.6 | HIGH | ↑ Worsening |

### 🟡 Borderline
| Parameter | Value | Unit | Ref Range | Status | Trend |
|-----------|-------|------|-----------|--------|-------|
| LDL Cholesterol | 128 | mg/dL | <130 | BORDERLINE | ↓ Improving |

### 🟢 Normal
| Parameter | Value | Unit | Ref Range | Status | Trend |
|-----------|-------|------|-----------|--------|-------|
| Hemoglobin | 13.5 | g/dL | 12-16 | NORMAL | → Stable |
| Creatinine | 0.9 | mg/dL | 0.6-1.2 | NORMAL | → Stable |
| TSH | 3.1 | mIU/L | 0.4-4.0 | NORMAL | → Stable |
| ... | ... | ... | ... | ... | ... |

---

## Historical Trends

### Diabetes Panel
| Date | Lab | FBS (mg/dL) | PP Sugar (mg/dL) | HbA1c (%) |
|------|-----|-------------|-------------------|-----------|
| 2025-01-15 | Thyrocare | 145 | 210 | 7.8 |
| 2024-07-20 | Dr Lal | 132 | 185 | 7.2 |
| 2024-01-10 | SRL | 118 | 165 | 6.8 |

**Observation:** FBS and HbA1c have been rising steadily over the past year.
Suggest discussing medication adjustment with physician.

### Kidney Panel
| Date | Lab | Uric Acid | Creatinine | BUN |
|------|-----|-----------|------------|-----|
| 2025-01-15 | Thyrocare | 8.2 | 0.9 | 14 |
| 2024-07-20 | Dr Lal | 8.0 | 0.8 | 13 |

**Observation:** Uric acid consistently elevated. Creatinine and BUN remain normal.

### Lipid Panel
| Date | Lab | Total Chol | HDL | LDL | Triglycerides |
|------|-----|-----------|-----|-----|---------------|
| 2025-01-15 | Thyrocare | 195 | 48 | 128 | 156 |
| 2024-07-20 | Dr Lal | 210 | 45 | 140 | 172 |

**Observation:** Lipid profile improving. LDL and triglycerides trending down.

### Thyroid Panel
| Date | Lab | TSH | T3 | T4 |
|------|-----|-----|----|----|
| 2025-01-15 | Thyrocare | 3.1 | 1.2 | 8.5 |

**Observation:** Single data point. Within normal limits.

### Blood Count
| Date | Lab | Hemoglobin | WBC | Platelets |
|------|-----|-----------|-----|-----------|
| 2025-01-15 | Thyrocare | 13.5 | 7200 | 2.5L |

**Observation:** All values normal.

*(More panels added as reports are uploaded)*

---

## Key Observations & Concerns

1. **Diabetes management declining** — FBS has risen from 118 to 145 over
   12 months. HbA1c crossed 7.5, indicating poor 3-month glucose control.
   Medication review recommended.

2. **Chronic hyperuricemia** — Uric acid has been above range in all available
   reports (8.0-8.2). Risk factor for gout and kidney stones. Dietary
   modifications (reduce purine-rich foods) and hydration recommended.

3. **Lipid profile improving** — Positive trend. Continue current approach.

4. **Overall kidney function intact** — Despite elevated uric acid, creatinine
   and BUN are well within range.

---

## Report Log
| # | Date | Lab | File | Parameters Extracted |
|---|------|-----|------|---------------------|
| 3 | 2025-01-15 | Thyrocare | thyrocare_jan2025.pdf | 42 |
| 2 | 2024-07-20 | Dr Lal PathLabs | drlal_jul2024.pdf | 38 |
| 1 | 2024-01-10 | SRL Diagnostics | srl_jan2024.pdf | 35 |
```

---

## 3. LHM Lifecycle

### Stage 1: Initialization (on signup)

When a user signs up, create a **skeleton LHM** with just the profile section:

```markdown
# Health Report — Priya Sharma

**Last Updated:** 2025-02-28
**Reports on File:** 0
**Last Checkup:** No reports uploaded yet
**Next Checkup Recommended:** Upload your first report to get started

---

## Patient Profile
- **Age:** 55
- **Gender:** Female
- **Blood Group:** Not available
- **Known Conditions:** Not available (will be inferred from reports)
- **Medications:** Not available
- **Allergies:** Not available

---

## Current Health Snapshot
*No reports uploaded yet. Upload your first health checkup PDF to see your snapshot here.*

---

## Historical Trends
*Trends will appear after 2+ reports are uploaded.*

---

## Key Observations & Concerns
*Will be generated after first report is processed.*

---

## Report Log
*No reports yet.*
```

### Stage 2: First Report Upload

After OCR + biomarker extraction from the first PDF:

**LLM Prompt:**
```
You are a health report system. You maintain a structured markdown health
document for each user.

Here is the user's CURRENT health markdown:
---
{current_lhm}
---

The user has just uploaded a new report. Here is the extracted data:
- Report Date: {report_date}
- Lab: {lab_name}
- Biomarkers: {biomarkers_json}

Your task:
1. Fill in the "Current Health Snapshot" tables — categorize each biomarker
   as 🔴 Needs Attention, 🟡 Borderline, or 🟢 Normal based on ref ranges
2. Set Trend to "→ New" since this is the first data point
3. Create the first row in each relevant "Historical Trends" panel
4. Write "Key Observations & Concerns" — plain English, non-medical-jargon
5. Infer any "Known Conditions" from the data if obvious
   (e.g., HbA1c > 6.5 → likely diabetic)
6. Update the "Report Log" table
7. Update metadata (Last Updated, Reports on File, Last Checkup, etc.)
8. Calculate "Next Checkup Recommended" — default to 6 months from report date

IMPORTANT:
- Maintain the EXACT markdown structure/format shown
- Do NOT remove any sections, even if empty
- Use the exact table column headers as shown
- Keep observations concise (2-3 sentences each)
- Never diagnose. Use phrases like "suggests", "may indicate",
  "consider discussing with your doctor"

Return the COMPLETE updated markdown document.
```

### Stage 3: Subsequent Report Uploads (The Merge)

This is the critical operation — **merging new data into the existing LHM without losing history**.

**LLM Prompt:**
```
You are a health report system. You maintain a structured markdown health
document for each user.

Here is the user's CURRENT health markdown:
---
{current_lhm}
---

The user has uploaded a NEW report. Here is the extracted data:
- Report Date: {report_date}
- Lab: {lab_name}
- Biomarkers: {biomarkers_json}

Your task — MERGE this new data into the existing document:

1. **Current Health Snapshot:**
   - Update ALL parameter values to reflect the LATEST available data
   - Recategorize (🔴/🟡/🟢) based on new values
   - Update Trend column by comparing new value with previous:
     - ↑ Worsening (moving further from normal)
     - ↓ Improving (moving toward normal)
     - → Stable (minimal change, < 5% difference)
     - If a parameter is new (not seen before), set trend to "→ New"

2. **Historical Trends:**
   - ADD a new row to each relevant panel table (do NOT replace old rows)
   - If a new panel category appears (e.g., first time Vitamin D is tested),
     create a new panel section
   - Update the panel "Observation" text based on the full trend

3. **Key Observations & Concerns:**
   - Rewrite this section entirely based on ALL available data
   - Highlight any significant changes from previous report
   - Flag any parameter that has crossed from normal to abnormal
   - Note improvements as well as deteriorations
   - Prioritize by severity

4. **Report Log:** Add the new report as the top entry

5. **Metadata:** Update all header fields

6. **Patient Profile:** Update "Known Conditions" if new evidence
   supports adding a condition

CRITICAL RULES:
- NEVER delete historical data from trend tables
- NEVER change previously recorded values
- Keep the EXACT markdown structure
- If a biomarker from a previous report is NOT in the new report,
  keep its last known value in the snapshot but note "(from {date})"
- Return the COMPLETE updated markdown document
```

---

## 4. Database Storage

```sql
-- One LHM per PROFILE (not per user)
CREATE TABLE user_health_markdown (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  markdown TEXT NOT NULL,
  version INT DEFAULT 1,                    -- increments on each update
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  last_report_date DATE,                    -- for quick query without parsing
  tokens_approx INT                         -- track size for context window mgmt
);
```

---

## 5. How LHM Powers Each Feature

### Dashboard
```
   Health report downloadable pdf generated by this markdown
```
   
```

### Chat / RAG Q&A
```
POST /api/chat
  → Fetch user's LHM as PRIMARY context
  → Optionally fetch relevant report_embeddings for specific queries
  → Build prompt:
    System: "You are a health assistant. Here is the patient's complete
    health profile: {lhm_markdown}. Answer their questions based on this."
  → User's question
  → Stream response

WHY: The LHM gives the LLM everything it needs in one document —
current values, history, trends, observations. No need for complex
RAG retrieval for most questions. RAG is only needed for very specific
queries about original report details.
```

### Monthly Email Digest
```
CRON: 1st of every month
  → Fetch user's LHM
  → Prompt: "Generate a monthly email summary from this health profile:
    {lhm_markdown}. Include: top concerns, improvements since last month,
    checkup reminder if overdue."
  → Send via Resend

WHY: The LHM already contains the narrative observations and trends.
The LLM just needs to reformat it as a friendly email.
```

---

## 6. Context Window Management

The LHM will grow over time. A user with 10+ reports across 50+ biomarkers
could have a document that's 3,000-5,000 tokens. This needs management.

### Size Limits
- **Target:** Keep LHM under 4,000 tokens (~3,000 words)
- **Track:** Store `tokens_approx` in DB, update on each save
- **If exceeding limit:** Trigger a "compression" pass

### Compression Strategy
When LHM exceeds 4,000 tokens:

```
Prompt: "The following health markdown has grown too large. Compress it
while preserving ALL of these:
- Current Health Snapshot (keep in full)
- Last 4 entries per Historical Trends panel (summarize older entries)
- Key Observations (keep in full)
- Report Log (keep last 6, summarize older as 'X earlier reports on file')

Previously: {full_lhm}
Return the compressed version maintaining the exact same structure."
```

### Archival
- Historical trend tables beyond the latest 4 entries get summarized
  into a line like: "3 earlier reports (2022-2023) showed FBS in range 105-118"
- Full history is ALWAYS available in the `biomarkers` DB table
- Old LHM versions are preserved in `lhm_history` for audit

---

## 7. Handling Edge Cases

### Different biomarkers across reports
Labs test different things. Report 1 might have thyroid but not Vitamin D.
Report 2 might have Vitamin D but not thyroid.

**Rule:** The Current Health Snapshot shows ALL biomarkers ever seen, with
a note of when they were last tested:
```
| TSH | 3.1 | mIU/L | 0.4-4.0 | NORMAL | → Stable (last: Jan 2025) |
| Vitamin D | 18 | ng/mL | 30-100 | LOW | → New (Feb 2025) |
```

### Conflicting reference ranges across labs
Thyrocare might say FBS normal range is 70-110, while Dr Lal says 74-106.

**Rule:** Use the reference range from the MOST RECENT report. Note in
the observation if there's a significant discrepancy.

### User corrects a value manually
If the user edits a value (OCR correction):
1. Update the biomarkers table
2. Trigger a LHM refresh (re-run the merge prompt with corrected data)
3. Save new version to lhm_history

### User deletes a report
1. Remove from biomarkers table
2. Full LHM regeneration from remaining biomarkers data
3. Save new version

---

## 8. Updated Processing Pipeline

```
User uploads PDF
       │
       ▼
[1-7]  OCR → Extract → Normalize → Store biomarkers (same as before)
       │
       ▼
[8]  ★ LHM UPDATE ★
     - Fetch current LHM from user_health_markdown
     - Build merge prompt with new biomarkers
     - Call Mistral LLM
     - Validate output (check structure preserved, no data loss)
     - Save new LHM + version to lhm_history
     - Update user_health_markdown with new content
       │
       ▼
[9]  Generate embeddings (for edge-case RAG queries)
       │
       ▼
[10] Notify user → "Report processed!"
```

---

## 9. Validation Layer (Important!)

The LLM generates the LHM, but we can't blindly trust it. Add validation:

```python
def validate_lhm(new_markdown: str, old_markdown: str, new_biomarkers: list) -> bool:
    """Validate LLM-generated LHM before saving."""

    checks = []

    # 1. Structure check: all required sections present
    required = [
        "## Patient Profile",
        "## Current Health Snapshot",
        "## Historical Trends",
        "## Key Observations",
        "## Report Log"
    ]
    checks.append(all(s in new_markdown for s in required))

    # 2. No data loss: old report dates still present in trend tables
    old_dates = extract_dates_from_trends(old_markdown)
    new_dates = extract_dates_from_trends(new_markdown)
    checks.append(old_dates.issubset(new_dates))

    # 3. New data included: new biomarker values appear in snapshot
    for bm in new_biomarkers:
        checks.append(str(bm["value"]) in new_markdown)

    # 4. Size check: within token limits
    checks.append(count_tokens(new_markdown) < 5000)

    # 5. No hallucinated values: spot check a few biomarkers
    # (compare values in markdown against DB)

    return all(checks)
```

If validation fails → log the issue, fall back to previous LHM version,
and queue for manual review or retry with a stricter prompt.

---

## 10. Why This Approach Wins

| Without LHM | With LHM |
|-------------|----------|
| Chat needs complex DB queries + RAG retrieval every time | Chat just reads one document |
| Dashboard computes status/trends on the fly | Dashboard parses pre-computed markdown |
| Email digest needs to aggregate data from scratch | Email reformats existing narrative |
| Each feature builds its own "understanding" of the user | Single shared understanding |
| LLM sees fragmented biomarker rows | LLM sees a coherent health story |
| Context is lost between conversations | Context is persistent and evolving |

The LHM is essentially a **pre-computed, LLM-friendly, human-readable cache**
of the user's entire health picture. It's the document your doctor would
maintain if they had perfect memory and unlimited time.

