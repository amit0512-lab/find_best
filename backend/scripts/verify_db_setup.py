"""Script to verify PostgreSQL database setup and tables."""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import text, inspect
from app.database.postgresql import engine
from app.config import settings


async def verify_connection():
    """Verify database connection."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✓ PostgreSQL connection successful")
            print(f"  Version: {version}")
            return True
    except Exception as e:
        print(f"✗ PostgreSQL connection failed: {e}")
        return False


async def verify_tables():
    """Verify all required tables exist."""
    required_tables = [
        'products_cache',
        'api_usage',
        'click_analytics',
        'sync_jobs',
        'circuit_breaker_state'
    ]
    
    try:
        async with engine.connect() as conn:
            # Get list of tables
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            existing_tables = [row[0] for row in result]
            
            print("\n✓ Checking tables:")
            all_exist = True
            for table in required_tables:
                if table in existing_tables:
                    print(f"  ✓ {table}")
                else:
                    print(f"  ✗ {table} (missing)")
                    all_exist = False
            
            return all_exist
    except Exception as e:
        print(f"✗ Error checking tables: {e}")
        return False


async def verify_indexes():
    """Verify indexes on products_cache table."""
    required_indexes = [
        'idx_products_product_id',
        'idx_products_category',
        'idx_products_cached_at',
        'idx_products_last_accessed',
        'idx_products_source',
        'idx_products_category_price',
        'idx_products_rating'
    ]
    
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'products_cache'
            """))
            existing_indexes = [row[0] for row in result]
            
            print("\n✓ Checking indexes on products_cache:")
            all_exist = True
            for index in required_indexes:
                if index in existing_indexes:
                    print(f"  ✓ {index}")
                else:
                    print(f"  ✗ {index} (missing)")
                    all_exist = False
            
            return all_exist
    except Exception as e:
        print(f"✗ Error checking indexes: {e}")
        return False


async def verify_jsonb_columns():
    """Verify JSONB columns exist."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'products_cache' 
                AND data_type = 'jsonb'
            """))
            jsonb_columns = [row[0] for row in result]
            
            print("\n✓ Checking JSONB columns on products_cache:")
            required_jsonb = ['specs', 'images', 'buy_links']
            all_exist = True
            for col in required_jsonb:
                if col in jsonb_columns:
                    print(f"  ✓ {col}")
                else:
                    print(f"  ✗ {col} (missing)")
                    all_exist = False
            
            return all_exist
    except Exception as e:
        print(f"✗ Error checking JSONB columns: {e}")
        return False


async def main():
    """Run all verification checks."""
    print("=" * 60)
    print("PostgreSQL Database Setup Verification")
    print("=" * 60)
    print(f"\nDatabase URL: {settings.POSTGRESQL_URL.split('@')[1] if '@' in settings.POSTGRESQL_URL else 'Not configured'}")
    print()
    
    # Run checks
    connection_ok = await verify_connection()
    if not connection_ok:
        print("\n✗ Cannot proceed without database connection")
        print("\nPlease ensure:")
        print("  1. PostgreSQL is running")
        print("  2. Database 'pickai_db' exists")
        print("  3. POSTGRESQL_URL in .env is correct")
        print("  4. Run migrations: alembic upgrade head")
        return False
    
    tables_ok = await verify_tables()
    indexes_ok = await verify_indexes()
    jsonb_ok = await verify_jsonb_columns()
    
    print("\n" + "=" * 60)
    if connection_ok and tables_ok and indexes_ok and jsonb_ok:
        print("✓ All checks passed! Database is properly configured.")
    else:
        print("✗ Some checks failed. Please run: alembic upgrade head")
    print("=" * 60)
    
    await engine.dispose()
    return connection_ok and tables_ok and indexes_ok and jsonb_ok


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
