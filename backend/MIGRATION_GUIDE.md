# Database Migration Quick Start Guide

This guide will help you set up the PostgreSQL database for PickAI.

## Quick Setup (5 minutes)

### Step 1: Install PostgreSQL

**Already have PostgreSQL?** Skip to Step 2.

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Run these commands in psql:
CREATE DATABASE pickai_db;
CREATE USER pickai_user WITH PASSWORD 'pickai123';
GRANT ALL PRIVILEGES ON DATABASE pickai_db TO pickai_user;
\q
```

### Step 3: Configure Environment

Create `backend/.env` file:
```bash
POSTGRESQL_URL=postgresql+asyncpg://pickai_user:pickai123@localhost:5432/pickai_db
```

### Step 4: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Run Migrations

```bash
# Apply all migrations
alembic upgrade head
```

### Step 6: Verify Setup

```bash
python scripts/verify_db_setup.py
```

You should see:
```
✓ All checks passed! Database is properly configured.
```

## Done! 🎉

Your PostgreSQL database is now set up with:
- ✓ 5 tables (products_cache, api_usage, click_analytics, sync_jobs, circuit_breaker_state)
- ✓ All required indexes
- ✓ JSONB columns for flexible data storage

## Common Issues

### "Connection refused"
PostgreSQL is not running. Start it:
```bash
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

### "Database does not exist"
Create the database:
```bash
sudo -u postgres psql -c "CREATE DATABASE pickai_db;"
```

### "Authentication failed"
Check your password in `.env` matches the one you set in Step 2.

## What's Next?

- Proceed to Task 1.2: Product Cache Service implementation
- See `DATABASE_SETUP.md` for detailed documentation
- See `design.md` for complete schema details

## Rollback (if needed)

To undo all migrations:
```bash
alembic downgrade base
```

## Need Help?

- Check `DATABASE_SETUP.md` for detailed troubleshooting
- View migration history: `alembic history`
- Check current version: `alembic current`
