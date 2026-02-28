# Supabase Database Setup (Cloud Only)

This directory contains SQL migrations for the HealthTrack database schema on Supabase Cloud.

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. You already have a Supabase Cloud project at: `jpfwvvavikkbrferkmuc.supabase.co`

## Setup Instructions

### 1. Link to your Supabase project

```bash
# Link to your cloud project (one-time setup)
pnpm db:link
```

Enter your database password when prompted.

### 2. Push migrations to cloud

```bash
# Apply all migrations to your cloud database
pnpm db:push
```

This will apply:
- `001_initial_schema.sql` - Core database schema with all tables and indexes
- `002_rls_policies.sql` - Row Level Security policies for data isolation
- `003_seed_biomarker_definitions.sql` - Reference data for 60+ biomarkers

### 3. Generate TypeScript types

```bash
# Generate types from your cloud database
pnpm db:types
```

This creates `src/types/database.types.ts` with type-safe database interfaces.

### 4. Verify setup

```bash
# Check database health and connectivity
pnpm db:check
```

Expected output:
```
✅ Database connected
✅ Tables exist
✅ Biomarker definitions loaded: 60
✅ All required tables present
```

## Migration Files

- `001_initial_schema.sql` - Core database schema with all tables and indexes
- `002_rls_policies.sql` - Row Level Security policies for data isolation
- `003_seed_biomarker_definitions.sql` - Reference data for biomarker normalization

## Environment Variables

Your `.env` file should have:

```env
SUPABASE_URL=https://jpfwvvavikkbrferkmuc.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

These values are in your Supabase project settings:
- https://supabase.com/dashboard/project/jpfwvvavikkbrferkmuc/settings/api

## Useful Commands

```bash
# Check migration status
pnpm db:status

# Push new migrations
pnpm db:push

# Regenerate types after schema changes
pnpm db:types

# Verify database connection
pnpm db:check
```

## Database Schema Overview

### Core Tables

- **users** - User accounts synced with Supabase Auth
- **profiles** - Health profiles (self and family members)
- **reports** - Uploaded PDF health reports
- **biomarkers** - Extracted biomarker values from reports
- **biomarker_definitions** - Reference data for biomarker normalization
- **user_health_markdown** - Living Health Markdown documents
- **lhm_history** - Version history of LHM documents
- **report_embeddings** - Vector embeddings for RAG Q&A
- **notification_prefs** - User email notification preferences

### Key Features

- **pgvector extension** enabled for semantic search
- **Row Level Security (RLS)** enforced on all user tables
- **Cascade deletes** configured for data consistency
- **Performance indexes** on frequently queried columns
- **Vector similarity search** using IVFFlat index

## Access Your Database

- **Dashboard**: https://supabase.com/dashboard/project/jpfwvvavikkbrferkmuc
- **Table Editor**: https://supabase.com/dashboard/project/jpfwvvavikkbrferkmuc/editor
- **SQL Editor**: https://supabase.com/dashboard/project/jpfwvvavikkbrferkmuc/sql
- **API Settings**: https://supabase.com/dashboard/project/jpfwvvavikkbrferkmuc/settings/api

## Troubleshooting

### Migration fails

Check if migrations were already applied:
```bash
pnpm db:status
```

### Connection fails

Verify your environment variables:
```bash
pnpm db:check
```

### Types not generating

Make sure migrations are applied first:
```bash
pnpm db:push
pnpm db:types
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

