# HBJJ - Backend Setup Guide

This guide will help you set up the complete backend infrastructure for HBJJ - Saúde & Jiu-Jitsu.

## Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL account (free tier available at [neon.tech](https://neon.tech))
- OpenAI API key (for Coach AI feature)
- Vercel account (for Blob storage and deployment, optional)

## Step 1: Install Dependencies

Due to PowerShell execution policy, you may need to run:

```powershell
# Enable script execution temporarily
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Install dependencies
npm install
```

Or manually run:
```bash
npm install
```

The following packages will be installed:
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `react-hook-form` - Form handling
- `@tanstack/react-query` - Data fetching
- `next-auth` - Authentication (v5 beta)
- `@auth/prisma-adapter` - NextAuth Prisma adapter
- `openai` - OpenAI API client
- `@vercel/blob` - Vercel Blob storage
- `date-fns` - Date utilities
- `@types/bcryptjs` - TypeScript types for bcryptjs

## Step 2: Set Up Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (database)
3. Copy the connection string from the Neon dashboard
4. Update your `.env` file:

```env
DATABASE_URL="postgresql://your-username:your-password@ep-xyz.us-east-2.aws.neon.tech/your-db?sslmode=require"
```

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication - NextAuth
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# AI Provider - OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=1000

# File Storage - Vercel Blob
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# App Configuration
NEXT_PUBLIC_APP_NAME=HBJJ
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and get your API key
3. Add it to your `.env` file

### Set Up Vercel Blob (Optional)

1. Go to [vercel.com/storage/blob](https://vercel.com/storage/blob)
2. Create a new Blob store
3. Copy the read/write token
4. Add it to your `.env` file

## Step 4: Initialize Prisma

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Seed the database with badges and sample data
npx prisma db seed
```

## Step 5: Update Prisma Schema for Seed

Add the seed script to `package.json` if not present:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Step 6: Verify Database Connection

Run the Prisma Studio to view your database:

```bash
npx prisma studio
```

This will open a browser window showing your database tables and data.

## Step 7: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## API Routes Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profiles
- `PUT /api/profile/athlete` - Update athlete profile
- `GET /api/profile/athlete` - Get athlete profile
- `PUT /api/profile/jiu-jitsu` - Update Jiu-Jitsu profile
- `GET /api/profile/jiu-jitsu` - Get Jiu-Jitsu profile

### Competitions
- `GET /api/competitions` - List competitions
- `POST /api/competitions` - Create competition
- `GET /api/competitions/[id]` - Get competition details
- `PUT /api/competitions/[id]` - Update competition
- `DELETE /api/competitions/[id]` - Delete competition

### Training Camps
- `GET /api/camp/active` - Get active camp
- `POST /api/camp/generate` - Generate new camp

### Training Sessions
- `GET /api/training-sessions` - List training sessions
- `POST /api/training-sessions` - Create training session
- `POST /api/training-sessions/[id]/complete` - Complete training session

### Nutrition
- `GET /api/nutrition/today` - Get today's nutrition data
- `PUT /api/nutrition/targets` - Update nutrition targets
- `GET /api/nutrition/targets` - Get nutrition targets
- `POST /api/meals` - Create meal log
- `PUT /api/meals` - Update meal log
- `DELETE /api/meals` - Delete meal log
- `POST /api/hydration` - Log hydration

### Missions & Gamification
- `GET /api/missions/today` - Get today's missions
- `POST /api/missions/[id]/complete` - Complete mission
- `GET /api/gamification` - Get gamification profile
- `GET /api/badges` - Get all badges

### Readiness
- `GET /api/readiness/today` - Get today's readiness
- `POST /api/readiness/check-in` - Submit readiness check-in
- `GET /api/readiness/history` - Get readiness history

### Progress
- `GET /api/progress` - Get progress logs
- `POST /api/progress` - Create progress log
- `POST /api/progress/photos` - Upload progress photo
- `DELETE /api/progress/photos` - Delete progress photo

### AI Coach
- `POST /api/ai/chat` - Chat with AI coach

### Reports
- `GET /api/reports/summary` - Get summary report

## Database Schema

The database includes the following main tables:

- `users` - User accounts and authentication
- `athlete_profiles` - Athlete physical data
- `jiu_jitsu_profiles` - Jiu-Jitsu training data
- `competitions` - Competition records
- `training_camps` - Training camp plans
- `camp_weeks` - Weekly camp phases
- `training_sessions` - Individual training sessions
- `training_exercises` - Exercises within sessions
- `nutrition_targets` - Daily nutrition goals
- `meal_logs` - Meal records
- `meal_items` - Individual food items
- `hydration_logs` - Water intake tracking
- `body_progress_logs` - Weight and measurements
- `progress_photos` - Progress photo uploads
- `daily_missions` - Daily challenge missions
- `gamification_profiles` - XP, levels, streaks
- `xp_events` - XP earning history
- `badges` - Achievement badges
- `user_badges` - User earned badges
- `readiness_logs` - Daily readiness scores
- `ai_conversations` - AI chat conversations
- `ai_messages` - Individual chat messages
- `ai_recommendations` - Cached AI recommendations
- `youtube_videos` - Video library
- `user_video_favorites` - User saved videos

## Security Notes

- All API routes currently use `x-user-id` header for authentication (placeholder for real session/JWT auth)
- Passwords are hashed with bcrypt
- Input validation with Zod on all endpoints
- Never commit `.env` file to version control
- Use strong secrets in production
- Implement rate limiting for AI endpoints (not yet implemented)

## Next Steps

1. Implement proper session/JWT authentication with NextAuth v5
2. Add rate limiting for AI endpoints
3. Implement proper error handling and logging
4. Add unit and integration tests
5. Set up CI/CD pipeline
6. Deploy to Vercel

## Troubleshooting

### Prisma Client Not Found
```bash
npx prisma generate
```

### Database Connection Error
- Verify `DATABASE_URL` is correct in `.env`
- Ensure Neon database is active
- Check SSL mode is set to `require`

### TypeScript Errors After npm install
- Run `npx prisma generate` to regenerate Prisma client
- Restart your TypeScript server/IDE

### AI Not Responding
- Verify `OPENAI_API_KEY` is set
- Check API key has credits
- Ensure `AI_MODEL` is valid

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Run migrations: `npx prisma migrate deploy`
6. Seed database: `npx prisma db seed`

## Support

For issues or questions, refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth Documentation](https://authjs.dev)
- [OpenAI Documentation](https://platform.openai.com/docs)
