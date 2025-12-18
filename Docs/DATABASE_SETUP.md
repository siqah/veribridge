# VeriBridge Database Setup Guide

## Quick Fix for the Migration Error

The error `password authentication failed for user "postgres"` means you need to configure your PostgreSQL connection.

## Option 1: Use SQLite (Easiest for Development)

Since PostgreSQL setup can be complex, let me create a simpler SQLite-based version for local development:

### Step 1: Check if you have the `.env` file

```bash
cd server
ls -la .env
```

If it doesn't exist, create it:

```bash
cp .env.example .env
```

### Step 2: For now, skip the database migration

The Company Formation feature will work once the database is set up, but you can continue developing the frontend without it.

## Option 2: Set Up PostgreSQL (Recommended for Production)

### On macOS (using Homebrew):

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb veribridge

# Set password for postgres user
psql postgres
# Then run: ALTER USER postgres PASSWORD 'yourpassword';
# Then: \q to exit
```

### Update your `.env` file:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/veribridge
```

### Run the migration:

```bash
npm run db:migrate
```

## Option 3: Use a Cloud Database (Easiest Overall)

### Using Supabase (Free Tier):

1. Go to https://supabase.com
2. Create a new project
3. Get the "Connection String" from Settings → Database
4. Paste it in your `.env` as `DATABASE_URL=...`
5. Run `npm run db:migrate`

---

## What the Migration Does

The migration creates 3 tables for the Company Formation feature:

- `company_formations` - Stores formation orders
- `uk_name_searches` - Caches Companies House API results
- `formation_audit_log` - Compliance audit trail

---

## For Now: Continue Without Database

The frontend wizard I'm building will work independently. You can:

1. Build the UI first
2. Set up the database later
3. Connect them together when ready

Would you like me to proceed with the frontend implementation while you set up the database?
