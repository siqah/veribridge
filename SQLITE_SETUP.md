# SQLite Database Setup for VeriBridge

## ✅ Completed Steps

1. ✅ Installed `better-sqlite3` (running in background)
2. ✅ Created SQLite schema (`schema.sqlite.sql`)
3. ✅ Created setup script (`setupSQLite.js`)
4. ✅ Updated formation routes to use SQLite

## 🚀 Next Steps

Once the npm install finishes, run:

```bash
# From the /server directory
cd server

# Set up the SQLite database (creates veribridge.db)
node src/db/setupSQLite.js
```

That's it! No PostgreSQL, no passwords, no hassle.

## What This Creates

A single file database: `/server/veribridge.db`

Contains 3 tables:

- `company_formations` - Formation orders -`uk_name_searches` - API cache
- `formation_audit_log` - Audit trail

## Testing

```bash
# Start the server (if not already running)
npm run dev

# Test the API
curl "http://localhost:3001/api/formation/uk-check-name?query=Test%20Ltd"
```

## Viewing the Data

You can inspect the SQLite database with:

```bash
# Install SQLite CLI (if not already installed)
brew install sqlite3

# Open the database
sqlite3 veribridge.db

# View tables
.tables

# View formation orders
SELECT * FROM company_formations;

# Exit
.quit
```

## Advantages of SQLite for Development

✅ **Zero Setup** - No server to configure  
✅ **Fast** - Perfect for local development  
✅ **Portable** - Single file, easy to backup  
✅ **Simple** - No authentication headaches

## Production Note

For production, you'll want to migrate to PostgreSQL or another production database. The SQLite version is perfect for:

- Local development
- Testing
- Demos
- Proof of concept

The backend code can easily switch between SQLite and PostgreSQL by changing the database connection logic.
