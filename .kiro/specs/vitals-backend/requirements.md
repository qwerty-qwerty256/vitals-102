# Requirements Document

## Introduction

HealthTrack MVP is a personal health report tracking system that enables users to upload medical checkup PDFs, extract and store biomarker data, visualize health trends over time, and receive intelligent insights through AI-powered analysis. The system supports multi-profile management, allowing users to track health data for themselves and family members, with automated monthly email digests and conversational Q&A capabilities.

## Glossary

- **System**: The HealthTrack backend API service
- **User**: An authenticated individual who owns an account
- **Profile**: A health data entity representing a person (self or family member)
- **Report**: A digitized health checkup document with extracted biomarker data
- **Biomarker**: A measurable health parameter (e.g., blood sugar, cholesterol)
- **LHM**: Living Health Markdown - a continuously updated health summary document per profile
- **OCR Service**: Mistral OCR API for PDF text extraction
- **LLM Service**: Mistral Chat API for analysis and natural language processing
- **Database**: PostgreSQL database via Supabase
- **Storage Service**: Cloud storage for PDF files (Supabase Storage/S3/R2)
- **Email Service**: Resend API for sending email notifications
- **Job Queue**: BullMQ with Redis for asynchronous task processing
- **Vector Store**: pgvector or Qdrant for RAG embeddings

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to securely sign up and log in to the system, so that my health data remains private and accessible only to me.

#### Acceptance Criteria

1. WHEN a user submits authentication credentials, THE System SHALL delegate authentication to Supabase Auth service
2. WHEN Supabase Auth returns a valid session, THE System SHALL create or retrieve the user record with the Supabase user identifier
3. WHERE Google OAuth is configured in Supabase, THE System SHALL allow users to authenticate using their Google account
4. WHEN an authenticated user makes an API request with a valid Supabase session token, THE System SHALL verify the token with Supabase Auth and authorize the request
5. WHEN Supabase Auth returns an authentication error, THE System SHALL return the error to the client without additional processing

### Requirement 2: Family Profile Management

**User Story:** As a user, I want to create and manage health profiles for myself and family members, so that I can track multiple people's health data in one place.

#### Acceptance Criteria

1. WHEN a new user completes signup, THE System SHALL automatically create a default profile with relationship type "self" and is_default flag set to true
2. WHEN a user creates a new profile, THE System SHALL store the profile with name, relationship type, date of birth, and gender
3. WHEN a user requests their profiles list, THE System SHALL return all profiles associated with their user account
4. WHEN a user updates a profile, THE System SHALL modify the specified profile fields and return the updated profile data
5. WHEN a user deletes a profile, THE System SHALL remove the profile and all associated reports, biomarkers, and embeddings from the Database

### Requirement 3: PDF Report Upload and Storage

**User Story:** As a user, I want to upload health checkup PDF files for a specific profile, so that the system can extract and store my medical data.

#### Acceptance Criteria

1. WHEN a user uploads a PDF file with a valid profile identifier, THE System SHALL store the file in the Storage Service and create a report record with status "pending"
2. WHEN a user provides a report date during upload, THE System SHALL store the date with the report record
3. WHEN a user uploads a file larger than 10MB, THE System SHALL reject the upload and return an error message
4. WHEN a user uploads a non-PDF file, THE System SHALL reject the upload and return an error message
5. WHEN a report is successfully stored, THE System SHALL enqueue a background job for OCR processing

### Requirement 4: OCR Processing and Data Extraction

**User Story:** As a user, I want the system to automatically extract biomarker data from my uploaded PDFs, so that I don't have to manually enter my test results.

#### Acceptance Criteria

1. WHEN a report processing job starts, THE System SHALL update the report status to "processing"
2. WHEN the OCR Service returns markdown text, THE System SHALL store the raw OCR output in the report record
3. WHEN the LLM Service extracts biomarkers from OCR text, THE System SHALL normalize biomarker names using the canonical mapping table
4. WHEN biomarker extraction completes, THE System SHALL store each biomarker with normalized name, value, unit, category, and associated profile identifier
5. IF OCR processing fails after three retry attempts, THEN THE System SHALL update the report status to "failed" and log the error details

### Requirement 5: Biomarker Normalization and Reference Ranges

**User Story:** As a user, I want the system to recognize different lab naming conventions and apply consistent reference ranges, so that my data is accurately interpreted regardless of which lab performed the test.

#### Acceptance Criteria

1. WHEN the System encounters a biomarker name, THE System SHALL map it to a canonical normalized name using the biomarker aliases table
2. WHEN a biomarker cannot be matched to existing aliases, THE System SHALL use the LLM Service to suggest the closest canonical name
3. WHEN storing biomarker values, THE System SHALL reference the biomarker_definitions table for display name, category, unit, and reference ranges
4. WHEN calculating biomarker status, THE System SHALL compare the value against ref_range_low and ref_range_high from biomarker_definitions
5. WHEN a biomarker value falls outside the reference range, THE System SHALL flag it as "high" or "low" status

### Requirement 6: Living Health Markdown (LHM) Management

**User Story:** As a user, I want the system to maintain an up-to-date health summary for each profile, so that I can quickly understand the current health status without reading through all reports.

**Reference:** See `lhm.md` for detailed LHM structure, lifecycle, and implementation patterns.

#### Acceptance Criteria

1. WHEN a new profile is created, THE System SHALL initialize a skeleton LHM document following the template structure defined in lhm.md
2. WHEN new biomarker data is extracted from a report, THE System SHALL update the associated profile's LHM by merging the new data via LLM Service using the merge prompt pattern from lhm.md
3. WHEN updating an LHM, THE System SHALL increment the version number, update the last_updated_at timestamp, and archive the previous version to lhm_history table
4. WHEN generating LHM content, THE System SHALL maintain the exact markdown structure with sections for Patient Profile, Current Health Snapshot, Historical Trends, Key Observations, and Report Log
5. WHEN an LHM exceeds 4000 tokens, THE System SHALL trigger a compression pass to summarize older historical entries while preserving the most recent 4 entries per trend panel

### Requirement 7: Dashboard Data Retrieval

**User Story:** As a user, I want to view a dashboard showing the latest health metrics for a selected profile, so that I can quickly assess their current health status.

#### Acceptance Criteria

1. WHEN a user requests dashboard data for a profile, THE System SHALL return the profile's current LHM document
2. WHEN a user requests dashboard data, THE System SHALL return the most recent biomarker values for the specified profile
3. WHEN calculating biomarker status for display, THE System SHALL join biomarker values with biomarker_definitions to determine normal, high, or low status
4. WHEN a profile has no reports, THE System SHALL return an empty biomarkers array and skeleton LHM
5. WHEN returning dashboard data, THE System SHALL include the number of days since the profile's last report date

### Requirement 8: Biomarker Trend Analysis

**User Story:** As a user, I want to view graphs showing how specific biomarkers have changed over time for a profile, so that I can identify improving or worsening health trends.

#### Acceptance Criteria

1. WHEN a user requests trend data for a specific biomarker and profile, THE System SHALL return all historical values ordered by report date ascending
2. WHEN returning trend data, THE System SHALL include reference range boundaries from biomarker_definitions for each data point
3. WHEN a biomarker has fewer than two data points, THE System SHALL return the available data without generating a trend line
4. WHEN trend data is requested for a non-existent biomarker, THE System SHALL return an empty array
5. WHEN returning trend data, THE System SHALL include value, unit, report date, and status for each data point

### Requirement 9: RAG-Powered Q&A System

**User Story:** As a user, I want to ask natural language questions about health data, so that I can get insights without manually searching through reports.

#### Acceptance Criteria

1. WHEN a user submits a question, THE System SHALL detect which profile the question refers to using keyword matching or current context
2. WHEN a profile is identified, THE System SHALL retrieve that profile's LHM as primary context for the LLM Service
3. WHEN additional context is needed, THE System SHALL perform vector similarity search against the profile's report embeddings in the Vector Store
4. WHEN generating a response, THE System SHALL instruct the LLM Service to cite specific values and dates from the health data
5. WHEN the LLM Service returns a response, THE System SHALL stream the response to the client in real-time

### Requirement 10: Vector Embeddings for RAG

**User Story:** As a system administrator, I want report content to be embedded and stored for semantic search, so that the Q&A system can retrieve relevant information from historical reports.

#### Acceptance Criteria

1. WHEN a report is successfully processed, THE System SHALL chunk the OCR markdown text into segments of maximum 500 tokens
2. WHEN text chunks are created, THE System SHALL generate embeddings using Mistral Embed API with 1024 dimensions
3. WHEN embeddings are generated, THE System SHALL store each chunk with its embedding vector, associated report identifier, and profile identifier in the Vector Store
4. WHEN performing semantic search, THE System SHALL query embeddings filtered by profile identifier to ensure profile-specific results
5. WHEN a report is deleted, THE System SHALL remove all associated embeddings from the Vector Store

### Requirement 11: Monthly Email Digest

**User Story:** As a user, I want to receive a monthly email summarizing health status for all my tracked profiles, so that I stay informed and remember to schedule checkups.

#### Acceptance Criteria

1. WHEN the monthly cron job executes, THE System SHALL query all users with email_digest_enabled set to true
2. WHEN processing a user for email digest, THE System SHALL fetch all profiles and their LHM documents for that user
3. WHEN generating email content, THE System SHALL use the LLM Service to create a family-wide summary prioritizing profiles with concerning values
4. WHEN a profile has not had a report uploaded in over 90 days, THE System SHALL include a checkup reminder in the email content
5. WHEN email content is generated, THE System SHALL send the email via the Email Service and update the last_sent_at timestamp

### Requirement 12: Notification Preferences Management

**User Story:** As a user, I want to control my email notification settings, so that I can choose whether and how often to receive health summaries.

#### Acceptance Criteria

1. WHEN a new user account is created, THE System SHALL initialize notification preferences with email_digest_enabled set to true and digest_frequency set to "monthly"
2. WHEN a user requests their notification preferences, THE System SHALL return the current settings including enabled status and frequency
3. WHEN a user updates notification preferences, THE System SHALL validate the digest_frequency value is one of "monthly" or "quarterly"
4. WHEN a user disables email digest, THE System SHALL skip that user during cron job execution
5. WHEN notification preferences are updated, THE System SHALL return the updated settings to confirm the change

### Requirement 13: Report Management

**User Story:** As a user, I want to view and delete uploaded reports for a profile, so that I can manage my health data and remove incorrect uploads.

#### Acceptance Criteria

1. WHEN a user requests reports for a profile, THE System SHALL return all reports associated with that profile ordered by report date descending
2. WHEN returning report data, THE System SHALL include file URL, report date, processing status, and upload timestamp
3. WHEN a user deletes a report, THE System SHALL remove the report record, associated biomarkers, and embeddings from the Database
4. WHEN a report is deleted, THE System SHALL remove the PDF file from the Storage Service
5. WHEN a report is deleted, THE System SHALL trigger an LHM update job to recalculate the profile's health summary without the deleted data

### Requirement 14: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error logging and graceful error handling, so that I can diagnose issues and ensure users receive helpful error messages.

#### Acceptance Criteria

1. WHEN an API request fails due to invalid input, THE System SHALL return a 400 status code with a descriptive error message
2. WHEN an API request fails due to authentication issues, THE System SHALL return a 401 status code
3. WHEN an API request fails due to authorization issues, THE System SHALL return a 403 status code with an explanation
4. WHEN an internal error occurs, THE System SHALL log the full error stack trace and return a 500 status code with a generic error message
5. WHEN an external service call fails, THE System SHALL log the error details and retry up to three times with exponential backoff before failing

### Requirement 15: Background Job Processing

**User Story:** As a system administrator, I want long-running tasks to be processed asynchronously, so that API responses remain fast and the system can handle concurrent uploads.

#### Acceptance Criteria

1. WHEN a report is uploaded, THE System SHALL enqueue an OCR processing job and return immediately with status "pending"
2. WHEN a job is enqueued, THE System SHALL assign a unique job identifier for tracking
3. WHEN a job fails, THE System SHALL retry up to three times with exponential backoff delays of 10, 30, and 90 seconds
4. WHEN a job exceeds maximum retry attempts, THE System SHALL mark it as permanently failed and log the error
5. WHEN processing jobs, THE System SHALL limit concurrent job execution to 5 workers to prevent resource exhaustion
