# Prisma + Supabase Setup Guide for VeriBridge

## Overview

This guide will help you set up PostgreSQL (via Supabase) with Prisma ORM for the VeriBridge project.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in the details:

   - **Project Name**: `veribridge` (or your preference)
   - **Database Password**: Create a strong password (**SAVE THIS!**)
   - **Region**: Choose closest to your users (e.g., `ap-southeast-1` for Asia)
   - **Pricing Plan**: Free tier is sufficient for development

4. Wait 2-3 minutes for Supabase to provision your database

---

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, click on the **Settings** icon (⚙️) in the left sidebar
2. Navigate to **Database**
3. Scroll down to "Connection string" section
4. Copy the **Connection string** (URI format)

You'll see something like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

5. **Important**: Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

---

## Step 3: Configure Your Environment

1. Navigate to the server directory:

   ```bash
   cd /Users/app/Desktop/veribridge/server
   ```

2. Open your `.env` file (create from `.env.example` if it doesn't exist):

   ```bash
   cp .env.example .env
   ```

3. Update the `DATABASE_URL` in `.env`:
   ```bash
   # Replace with your actual Supabase connection string
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

---

## Step 4: Install Dependencies & Run Prisma Migrations

The dependencies should already be installed from the previous step. Now let's set up the database schema:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create all tables
npm run prisma:migrate

# When prompted for a migration name, enter: init
```

This will:

- Create all tables defined in `prisma/schema.prisma`
- Generate Prisma Client for type-safe database queries
- Create a `migrations` folder tracking database changes

---

## Step 5: Verify the Setup

### Option 1: Using Prisma Studio (Visual Database Browser)

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:

- Browse all your tables
- View,add, edit, and delete records
- Test database relationships

### Option 2: Test with the Server

```bash
npm run dev
```

The server should start without database errors. You should see:

```
✅ Database connected successfully (PostgreSQL via Prisma)
╔═══════════════════════════════════════════════╗
║     VeriBridge API Server                     ║
║     Running on http://localhost:3001          ║
╚═══════════════════════════════════════════════╝
```

---

## Step 6: Test Authentication Flow

1. **Signup**: `POST /api/auth/signup`

   ```bash
   curl -X POST http://localhost:3001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "fullName": "Test User"
     }'
   ```

2. **Login**: `POST /api/auth/login`

   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. Open Prisma Studio to verify the user was created in the `users` table

---

## Common Troubleshooting

### Error: "Can't reach database server"

- **Cause**: Incorrect DATABASE_URL or Supabase project not ready
- **Fix**:
  1. Double-check your connection string
  2. Ensure password is correctly replaced
  3. Verify Supabase project status in dashboard

### Error: "password authentication failed"

- **Cause**: Wrong password in DATABASE_URL
- **Fix**: Copy the correct password from your Supabase project settings

### Error: "SSL connection required"

- **Cause**: Supabase requires SSL
- **Fix**: Add `?sslmode=require` to your DATABASE_URL:
  ```
  DATABASE_URL=postgresql://...?sslmode=require
  ```

### Error: "Migration failed"

- **Fix**: Delete the `prisma/migrations` folder and try again:
  ```bash
  rm -rf prisma/migrations
  npm run prisma:migrate
  ```

---

## Production Deployment Notes

### For Production/Serverless Environments

Supabase provides two connection strings:

1. **Direct Connection** (Port 5432) - For migrations and single-instance apps
2. **Connection Pooling** (Port 6543) - For serverless/production

Update your production `.env`:

```bash
# Use pooling for production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true

# Keep direct URL for migrations
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

Then update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Useful Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Push schema without creating migration (for prototyping)
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio

# Reset database (DANGER: Deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

---

## Next Steps

1. ✅ Test user authentication (signup/login)
2. ✅ Create a company formation order
3. ✅ Test email verification flow
4. View data in Prisma Studio
5. Deploy to production with pooled connections

---

## Need Help?

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **VeriBridge Schema**: Check `server/prisma/schema.prisma` for all models
