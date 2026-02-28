# HealthTrack MVP Backend

Personal health report tracking system with AI-powered analysis.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Install Supabase CLI
npm install -g supabase

# 3. Set up database (one-time)
pnpm db:link      # Link to your Supabase project
pnpm db:push      # Apply migrations
pnpm db:types     # Generate TypeScript types
pnpm db:check     # Verify setup

# 4. Start development server
pnpm dev
```

Server runs on http://localhost:3000

## Documentation

- **Quick Start**: `QUICK-START.md` - Get up and running in 5 minutes
- **Database Setup**: `docs/supabase-cloud-setup.md` - Complete Supabase guide
- **Migrations**: `supabase/README.md` - Database schema and migrations
- **LHM Guide**: `docs/lhm.md` - Living Health Markdown documentation
- **Spec**: `.kiro/specs/vitals-backend/` - Requirements, design, and tasks

## Available Commands

```bash
# Development
pnpm dev          # Start dev server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:link      # Link to Supabase project (one-time)
pnpm db:push      # Push migrations to cloud
pnpm db:types     # Generate TypeScript types
pnpm db:check     # Verify database health
pnpm db:status    # View migration status

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format with Prettier
pnpm typecheck    # TypeScript type checking
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (Supabase Cloud)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Queue**: BullMQ + Redis
- **AI**: Mistral AI (OCR, Chat, Embeddings)
- **Email**: Resend
- **Vector DB**: pgvector (Supabase)

## Project Structure

```
vitals/
├── src/
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API route definitions
│   ├── middlewares/      # Express middleware
│   ├── validations/      # Zod schemas
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── workers/          # Background job processors
│   ├── constants/        # Constants and configs
│   └── server.ts         # Application entry point
├── supabase/
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
└── .kiro/specs/          # Feature specifications
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Supabase (already configured)
SUPABASE_URL=https://jpfwvvavikkbrferkmuc.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (already configured)
REDIS_URL=redis-16050.crce276.ap-south-1-3.ec2.cloud.redislabs.com:16050

# Mistral AI (configure these)
MISTRAL_API_KEY=your-mistral-api-key

# Resend Email (configure these)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## Features

- 🔐 User authentication via Supabase Auth
- 👨‍👩‍👧‍👦 Multi-profile management (self + family)
- 📄 PDF report upload and OCR processing
- 🧬 Biomarker extraction and normalization
- 📊 Health trend visualization
- 🤖 AI-powered health insights
- 💬 RAG-powered Q&A system
- 📧 Monthly email digests
- 🔒 Row Level Security (RLS)

## API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/profiles
POST   /api/profiles
GET    /api/profiles/:id
PATCH  /api/profiles/:id
DELETE /api/profiles/:id
POST   /api/reports
GET    /api/reports
DELETE /api/reports/:id
GET    /api/dashboard/:profileId
GET    /api/biomarkers/:profileId/trends
POST   /api/chat
GET    /api/settings/notifications
PATCH  /api/settings/notifications
```

## Development Workflow

1. **Create feature branch**
2. **Implement feature** (follow tasks in `.kiro/specs/vitals-backend/tasks.md`)
3. **Test locally** with `pnpm dev`
4. **Run linting** with `pnpm lint:fix`
5. **Type check** with `pnpm typecheck`
6. **Commit and push**

## Database Migrations

When modifying the schema:

```bash
# Create new migration
supabase migration new feature_name

# Edit the SQL file in supabase/migrations/

# Push to cloud
pnpm db:push

# Regenerate types
pnpm db:types
```

## Troubleshooting

**Database connection issues?**
```bash
pnpm db:check
```

**Type errors after schema changes?**
```bash
pnpm db:types
pnpm typecheck
```

**Migration issues?**
```bash
pnpm db:status
```

See `docs/supabase-cloud-setup.md` for detailed troubleshooting.

## License

MIT
