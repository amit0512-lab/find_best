# PostgreSQL Database Setup

This document provides instructions for setting up the PostgreSQL database for the PickAI application.

## Prerequisites

- PostgreSQL 12 or higher installed
- Python 3.8+ with pip

## Installation Steps

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE pickai_db;

# Create user (optional, if not using default postgres user)
CREATE USER pickai_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pickai_db TO pickai_user;

# Exit
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory (or copy from `.env.example`):

```bash
# PostgreSQL Configuration
POSTGRESQL_URL=postgresql+asyncpg://pickai_user:your_password@localhost:5432/pickai_db
```

**Note:** The URL format is:
```
postgresql+asyncpg://username:password@host:port/database_name
```

### 4. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `sqlalchemy` - ORM for database operations
- `alembic` - Database migration tool
- `psycopg2-binary` - PostgreSQL adapter
- `asyncpg` - Async PostgreSQL driver

### 5. Run Database Migrations

```bash
# Initialize Alembic (already done, skip this)
# alembic init alembic

# Run migrations to create tables
alembic upgrade head
```

This will create the following tables:
- `products_cache` - Stores cached product data
- `api_usage` - Tracks API rate limiting
- `click_analytics` - Tracks buy link clicks
- `sync_jobs` - Background job history
- `circuit_breaker_state` - API health monitoring

### 6. Verify Setup

Run the verification script:

```bash
python scripts/verify_db_setup.py
```

Expected output:
```
============================================================
PostgreSQL Database Setup Verification
============================================================

Database URL: localhost:5432/pickai_db

✓ PostgreSQL connection successful
  Version: PostgreSQL 14.x ...

✓ Checking tables:
  ✓ products_cache
  ✓ api_usage
  ✓ click_analytics
  ✓ sync_jobs
  ✓ circuit_breaker_state

✓ Checking indexes on products_cache:
  ✓ idx_products_product_id
  ✓ idx_products_category
  ✓ idx_products_cached_at
  ✓ idx_products_last_accessed
  ✓ idx_products_source
  ✓ idx_products_category_price
  ✓ idx_products_rating

✓ Checking JSONB columns on products_cache:
  ✓ specs
  ✓ images
  ✓ buy_links

============================================================
✓ All checks passed! Database is properly configured.
============================================================
```

## Database Schema

### products_cache

Stores cached product data with JSONB columns for flexible storage.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| product_id | VARCHAR(255) | Unique product identifier |
| source | VARCHAR(50) | Data source (amazon, flipkart, aggregated) |
| name | VARCHAR(500) | Product name |
| category | VARCHAR(100) | Product category |
| subcategory | VARCHAR(100) | Product subcategory |
| price | NUMERIC(10,2) | Product price |
| currency | VARCHAR(10) | Currency code (default: INR) |
| rating | NUMERIC(3,2) | Product rating (0-5) |
| review_count | INTEGER | Number of reviews |
| specs | JSONB | Product specifications |
| images | JSONB | Array of image URLs |
| buy_links | JSONB | Buy links (official, amazon, flipkart) |
| cached_at | TIMESTAMP | When data was cached |
| last_accessed | TIMESTAMP | Last access time |
| access_count | INTEGER | Number of accesses |
| ttl_hours | INTEGER | Time to live in hours |
| is_available | BOOLEAN | Product availability |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_products_product_id` (UNIQUE) - Fast lookup by product ID
- `idx_products_category` - Filter by category/subcategory
- `idx_products_cached_at` - Find stale cache entries
- `idx_products_last_accessed` - LRU eviction
- `idx_products_source` - Filter by data source
- `idx_products_category_price` - Price range queries
- `idx_products_rating` - Rating filters

### api_usage

Tracks API usage for rate limiting.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| api_name | VARCHAR(100) | API name (unique) |
| requests_per_second | INTEGER | Current requests/second |
| requests_per_day | INTEGER | Current requests/day |
| limit_per_second | INTEGER | Rate limit per second |
| limit_per_day | INTEGER | Rate limit per day |
| last_reset | TIMESTAMP | Last counter reset |
| warnings | JSONB | Warning messages |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### click_analytics

Tracks buy link clicks for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| tracking_id | VARCHAR(255) | Unique tracking ID |
| product_id | VARCHAR(255) | Product identifier |
| platform | VARCHAR(50) | Platform (amazon, flipkart, official) |
| user_id | VARCHAR(255) | User identifier (optional) |
| clicked_at | TIMESTAMP | Click timestamp |
| converted | BOOLEAN | Conversion status |
| conversion_value | NUMERIC(10,2) | Conversion value |
| created_at | TIMESTAMP | Record creation time |

### sync_jobs

Background job execution history.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| job_id | VARCHAR(255) | Unique job ID |
| started_at | TIMESTAMP | Job start time |
| completed_at | TIMESTAMP | Job completion time |
| products_updated | INTEGER | Products updated count |
| products_failed | INTEGER | Failed products count |
| api_calls_made | INTEGER | API calls made |
| errors | JSONB | Error details |
| status | VARCHAR(50) | Job status (running, completed, failed) |
| created_at | TIMESTAMP | Record creation time |

### circuit_breaker_state

API health monitoring state.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| api_name | VARCHAR(100) | API name (unique) |
| state | VARCHAR(20) | Circuit state (CLOSED, OPEN, HALF_OPEN) |
| failure_count | INTEGER | Consecutive failures |
| last_failure_time | TIMESTAMP | Last failure timestamp |
| last_success_time | TIMESTAMP | Last success timestamp |
| updated_at | TIMESTAMP | Last update time |

## Alembic Commands

### Create a new migration

```bash
alembic revision -m "description of changes"
```

### Apply migrations

```bash
# Upgrade to latest
alembic upgrade head

# Upgrade one version
alembic upgrade +1

# Upgrade to specific revision
alembic upgrade <revision_id>
```

### Rollback migrations

```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade <revision_id>

# Downgrade all
alembic downgrade base
```

### View migration history

```bash
# Show current version
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic heads
```

## Troubleshooting

### Connection refused

**Problem:** Cannot connect to PostgreSQL

**Solution:**
1. Check if PostgreSQL is running: `sudo systemctl status postgresql`
2. Start PostgreSQL: `sudo systemctl start postgresql`
3. Verify port 5432 is open: `sudo netstat -plnt | grep 5432`

### Authentication failed

**Problem:** Password authentication failed

**Solution:**
1. Check credentials in `.env` file
2. Reset password: `ALTER USER pickai_user WITH PASSWORD 'new_password';`
3. Check `pg_hba.conf` for authentication method

### Database does not exist

**Problem:** Database "pickai_db" does not exist

**Solution:**
```bash
sudo -u postgres psql
CREATE DATABASE pickai_db;
\q
```

### Permission denied

**Problem:** Permission denied for database

**Solution:**
```bash
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE pickai_db TO pickai_user;
\q
```

### Migration fails

**Problem:** Alembic migration fails

**Solution:**
1. Check database connection
2. View current version: `alembic current`
3. Check migration history: `alembic history`
4. Manually fix database if needed
5. Stamp current version: `alembic stamp head`

## Performance Tuning

### Analyze query performance

```sql
EXPLAIN ANALYZE SELECT * FROM products_cache WHERE category = 'Mobile';
```

### Rebuild indexes

```sql
REINDEX TABLE products_cache;
```

### Vacuum database

```sql
VACUUM ANALYZE products_cache;
```

### Monitor table sizes

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Backup and Restore

### Backup database

```bash
pg_dump -U pickai_user -d pickai_db -F c -f backup.dump
```

### Restore database

```bash
pg_restore -U pickai_user -d pickai_db -c backup.dump
```

## Next Steps

After setting up the database:

1. Proceed to Task 1.2: Implement Product Cache Service
2. Configure API credentials for Amazon and Flipkart
3. Run initial data seeding script (Task 8.1)
4. Test with real data integration

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg/)
