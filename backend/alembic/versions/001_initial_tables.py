"""Initial tables for product caching and analytics

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create products_cache table
    op.create_table(
        'products_cache',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.String(length=255), nullable=False),
        sa.Column('source', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=500), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('subcategory', sa.String(length=100), nullable=False),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
        sa.Column('rating', sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('specs', JSONB, nullable=True),
        sa.Column('images', JSONB, nullable=True),
        sa.Column('buy_links', JSONB, nullable=True),
        sa.Column('cached_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('last_accessed', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('access_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('ttl_hours', sa.Integer(), nullable=False, server_default='24'),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for products_cache
    op.create_index('idx_products_product_id', 'products_cache', ['product_id'], unique=True)
    op.create_index('idx_products_category', 'products_cache', ['category', 'subcategory'])
    op.create_index('idx_products_cached_at', 'products_cache', ['cached_at'])
    op.create_index('idx_products_last_accessed', 'products_cache', ['last_accessed'])
    op.create_index('idx_products_source', 'products_cache', ['source'])
    op.create_index('idx_products_category_price', 'products_cache', ['category', 'price'])
    op.create_index('idx_products_rating', 'products_cache', ['rating'])
    
    # Create api_usage table
    op.create_table(
        'api_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('api_name', sa.String(length=100), nullable=False),
        sa.Column('requests_per_second', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('requests_per_day', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('limit_per_second', sa.Integer(), nullable=False),
        sa.Column('limit_per_day', sa.Integer(), nullable=False),
        sa.Column('last_reset', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('warnings', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create unique index for api_usage
    op.create_index('idx_api_usage_name', 'api_usage', ['api_name'], unique=True)
    
    # Create click_analytics table
    op.create_table(
        'click_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tracking_id', sa.String(length=255), nullable=False),
        sa.Column('product_id', sa.String(length=255), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=True),
        sa.Column('clicked_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('converted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('conversion_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for click_analytics
    op.create_index('idx_clicks_tracking_id', 'click_analytics', ['tracking_id'], unique=True)
    op.create_index('idx_clicks_product', 'click_analytics', ['product_id'])
    op.create_index('idx_clicks_platform', 'click_analytics', ['platform'])
    op.create_index('idx_clicks_date', 'click_analytics', ['clicked_at'])
    op.create_index('idx_clicks_user', 'click_analytics', ['user_id'])
    
    # Create sync_jobs table
    op.create_table(
        'sync_jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(length=255), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('products_updated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('products_failed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('api_calls_made', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('errors', JSONB, nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='running'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for sync_jobs
    op.create_index('idx_sync_jobs_job_id', 'sync_jobs', ['job_id'], unique=True)
    op.create_index('idx_sync_jobs_status', 'sync_jobs', ['status'])
    op.create_index('idx_sync_jobs_started', 'sync_jobs', ['started_at'])
    
    # Create circuit_breaker_state table
    op.create_table(
        'circuit_breaker_state',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('api_name', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=20), nullable=False),
        sa.Column('failure_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_failure_time', sa.DateTime(), nullable=True),
        sa.Column('last_success_time', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create unique index for circuit_breaker_state
    op.create_index('idx_circuit_breaker_api_name', 'circuit_breaker_state', ['api_name'], unique=True)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('idx_circuit_breaker_api_name', table_name='circuit_breaker_state')
    op.drop_table('circuit_breaker_state')
    
    op.drop_index('idx_sync_jobs_started', table_name='sync_jobs')
    op.drop_index('idx_sync_jobs_status', table_name='sync_jobs')
    op.drop_index('idx_sync_jobs_job_id', table_name='sync_jobs')
    op.drop_table('sync_jobs')
    
    op.drop_index('idx_clicks_user', table_name='click_analytics')
    op.drop_index('idx_clicks_date', table_name='click_analytics')
    op.drop_index('idx_clicks_platform', table_name='click_analytics')
    op.drop_index('idx_clicks_product', table_name='click_analytics')
    op.drop_index('idx_clicks_tracking_id', table_name='click_analytics')
    op.drop_table('click_analytics')
    
    op.drop_index('idx_api_usage_name', table_name='api_usage')
    op.drop_table('api_usage')
    
    op.drop_index('idx_products_rating', table_name='products_cache')
    op.drop_index('idx_products_category_price', table_name='products_cache')
    op.drop_index('idx_products_source', table_name='products_cache')
    op.drop_index('idx_products_last_accessed', table_name='products_cache')
    op.drop_index('idx_products_cached_at', table_name='products_cache')
    op.drop_index('idx_products_category', table_name='products_cache')
    op.drop_index('idx_products_product_id', table_name='products_cache')
    op.drop_table('products_cache')
