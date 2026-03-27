# Design Document

## Introduction

This document provides the technical design for integrating real product data into PickAI. The design covers affiliate API integration (Amazon PA-API, Flipkart), caching strategies, error handling, and migration from mock data.

## System Architecture

### Component Overview

**Frontend Layer (React + Vite)**
- Decision Tree, Product List, Product Card components
- Communicates with backend via REST API
- No direct API calls to e-commerce platforms

**Backend Layer (FastAPI + PostgreSQL)**
- Product_Data_Service: Main orchestrator for product data operations
- Rate_Limiter: Manages API quotas and prevents overuse
- Product_Aggregator: Merges data from multiple sources
- Product_Validator: Ensures data quality
- Buy_Link_Tracker: Generates affiliate links and tracks clicks
- Fallback_Handler: Provides cached data when APIs fail
- Data_Sync_Job: Background task for data refresh

**External Services**
- Amazon Product Advertising API (PA-API 5.0)
- Flipkart Affiliate API
- PostgreSQL for caching and analytics

**Data Flow**
1. User requests products → Frontend → Backend API
2. Backend checks Product_Cache (PostgreSQL)
3. If cache miss or stale → Query Affiliate_APIs
4. Rate_Limiter enforces quotas
5. Product_Aggregator merges multi-source data
6. Product_Validator checks quality
7. Store in Product_Cache
8. Return to frontend


## Component Design

### 1. Product_Data_Service

**Purpose**: Central service orchestrating all product data operations

**Responsibilities**:
- Route product requests to appropriate data sources
- Coordinate between cache, APIs, and validators
- Implement feature flag for mock vs real data mode
- Expose REST endpoints for frontend

**Key Methods**:
```python
async def get_products(category: str, filters: dict) -> List[Product]
async def get_product_by_id(product_id: str) -> Product
async def search_products(query: str, filters: dict) -> List[Product]
async def refresh_product_data(product_id: str) -> Product
```

**Configuration**:
- USE_REAL_DATA: bool (feature flag)
- CACHE_TTL_HOURS: int (default 24)
- API_TIMEOUT_SECONDS: int (default 10)

### 2. Affiliate_API Integrations

**Amazon PA-API Integration**

**Authentication**: AWS Signature Version 4
- Access Key, Secret Key, Partner Tag
- Request signing with HMAC-SHA256

**Key Operations**:
```python
async def search_items(keywords: str, category: str) -> List[AmazonProduct]
async def get_items(asin_list: List[str]) -> List[AmazonProduct]
async def get_variations(asin: str) -> List[AmazonProduct]
```

**Response Mapping**:
- ASIN → product_id
- ItemInfo.Title → name
- Offers.Listings[0].Price → price
- CustomerReviews.StarRating → rating
- Images.Primary.Large.URL → image
- DetailPageURL → buyLinks.amazon


**Flipkart Affiliate API Integration**

**Authentication**: Affiliate ID and Token in headers
- Fk-Affiliate-Id: {affiliate_id}
- Fk-Affiliate-Token: {token}

**Key Operations**:
```python
async def search_products(query: str, category: str) -> List[FlipkartProduct]
async def get_product_details(product_id: str) -> FlipkartProduct
```

**Response Mapping**:
- productId → product_id
- title → name
- sellingPrice.amount → price
- productRating → rating
- imageUrls[0] → image
- productUrl → buyLinks.flipkart

### 3. Rate_Limiter

**Purpose**: Enforce API quotas and prevent service interruptions

**Implementation**: Token bucket algorithm with PostgreSQL backend

**Rate Limits**:
- Amazon PA-API: 1 request/second, 8640 requests/day
- Flipkart: 10 requests/second, 50000 requests/day

**Key Methods**:
```python
async def check_rate_limit(api_name: str) -> bool
async def increment_usage(api_name: str) -> None
async def get_usage_stats(api_name: str) -> dict
async def reset_counters(api_name: str) -> None
```

**Behavior**:
- Track requests per second and per day
- Log warning at 80% capacity
- Return False when limit exceeded
- Trigger Fallback_Handler when blocked


### 4. Product_Cache (PostgreSQL)

**Purpose**: Store fetched product data to reduce API calls

**Table Schema**:
```sql
CREATE TABLE products_cache (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL,  -- 'amazon', 'flipkart', 'aggregated'
  name VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  specs JSONB,  -- Flexible JSON storage for specifications
  images JSONB,  -- Array of image URLs
  buy_links JSONB,  -- {official, amazon, flipkart}
  cached_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMP NOT NULL DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  ttl_hours INTEGER DEFAULT 24,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX idx_products_category ON products_cache(category, subcategory);
CREATE INDEX idx_products_cached_at ON products_cache(cached_at);
CREATE INDEX idx_products_last_accessed ON products_cache(last_accessed);
CREATE INDEX idx_products_source ON products_cache(source);
CREATE INDEX idx_products_category_price ON products_cache(category, price);
CREATE INDEX idx_products_rating ON products_cache(rating);
```

**Cache Strategy**:
- TTL: 24 hours default (configurable per category)
- Eviction: LRU when storage > 90%
- Warming: Pre-fetch popular products
- Invalidation: Manual via admin API or on sync job

### 5. Product_Aggregator

**Purpose**: Merge product data from multiple sources

**Merging Strategy**:
1. Use most recent data (cached_at timestamp)
2. Prefer official prices over marketplace
3. Combine specs from all sources
4. Keep all buy links
5. Use highest rating if multiple sources

**Key Methods**:
```python
async def aggregate_product(sources: List[Product]) -> Product
async def resolve_conflicts(field: str, values: List[Any]) -> Any
```


### 6. Product_Validator

**Purpose**: Ensure data quality before caching/serving

**Validation Rules**:
- name: non-empty string, max 200 chars
- price: positive number
- rating: 0-5 range
- category: must match predefined categories
- images: at least 1 valid URL
- buyLinks: at least 1 non-empty link
- specs: at least 3 key-value pairs

**Key Methods**:
```python
def validate_product(product: Product) -> ValidationResult
def get_validation_errors(product: Product) -> List[str]
```

**Behavior**:
- Log validation failures with product_id
- Exclude invalid products from results
- Store validation stats for monitoring

### 7. Buy_Link_Tracker

**Purpose**: Generate affiliate links and track clicks

**Link Generation**:
```python
def generate_amazon_link(asin: str, partner_tag: str) -> str
def generate_flipkart_link(product_id: str, affiliate_id: str) -> str
def add_tracking_params(url: str, tracking_id: str) -> str
```

**Click Tracking Schema**:
```sql
CREATE TABLE click_analytics (
  id SERIAL PRIMARY KEY,
  tracking_id VARCHAR(255) UNIQUE NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,  -- 'amazon', 'flipkart', 'official'
  user_id VARCHAR(255),
  clicked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON click_analytics(product_id);
CREATE INDEX idx_clicks_platform ON click_analytics(platform);
CREATE INDEX idx_clicks_date ON click_analytics(clicked_at);
CREATE INDEX idx_clicks_user ON click_analytics(user_id);
```

**Analytics Methods**:
```python
async def log_click(product_id: str, platform: str) -> str
async def get_click_stats(product_id: str) -> dict
async def get_ctr_by_category() -> dict
```


### 8. Fallback_Handler

**Purpose**: Provide cached data when APIs fail

**Circuit Breaker Pattern**:
- States: CLOSED, OPEN, HALF_OPEN
- Failure threshold: 5 consecutive failures
- Open duration: 5 minutes
- Half-open test: 1 request

**Key Methods**:
```python
async def handle_api_failure(api_name: str, error: Exception) -> None
async def get_fallback_data(query: dict) -> List[Product]
def get_circuit_state(api_name: str) -> str
```

**Behavior**:
- Serve cached data with staleness indicator
- Log all failures with context
- Automatically recover when API is healthy

### 9. Data_Sync_Job

**Purpose**: Background task to refresh cached product data

**Schedule**: Every 24 hours (configurable)

**Sync Strategy**:
1. Query products by last_accessed (prioritize recent)
2. Check cached_at age
3. Refresh if > TTL
4. Update price, availability, rating
5. Log sync statistics

**Key Methods**:
```python
async def run_sync_job() -> SyncResult
async def sync_category(category: str) -> int
async def sync_product(product_id: str) -> bool
```

**Sync Result Schema**:
```sql
CREATE TABLE sync_jobs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) UNIQUE NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  products_updated INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  errors JSONB,  -- Array of error objects
  status VARCHAR(50) DEFAULT 'running',  -- 'running', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_started ON sync_jobs(started_at);
```

**Additional Tables**:
```sql
-- API Usage Tracking
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  api_name VARCHAR(100) NOT NULL,
  requests_per_second INTEGER DEFAULT 0,
  requests_per_day INTEGER DEFAULT 0,
  limit_per_second INTEGER NOT NULL,
  limit_per_day INTEGER NOT NULL,
  last_reset TIMESTAMP NOT NULL DEFAULT NOW(),
  warnings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_api_usage_name ON api_usage(api_name);

-- Circuit Breaker State
CREATE TABLE circuit_breaker_state (
  id SERIAL PRIMARY KEY,
  api_name VARCHAR(100) UNIQUE NOT NULL,
  state VARCHAR(20) NOT NULL,  -- 'CLOSED', 'OPEN', 'HALF_OPEN'
  failure_count INTEGER DEFAULT 0,
  last_failure_time TIMESTAMP,
  last_success_time TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```


## API Design

### Backend REST Endpoints

**Product Endpoints**

```
GET /api/products
Query params: category, subcategory, min_price, max_price, min_rating, sort, page, limit
Response: { products: List[Product], total: int, page: int }

GET /api/products/{product_id}
Response: Product

GET /api/products/search
Query params: q (query), category, filters, page, limit
Response: { products: List[Product], total: int }

POST /api/admin/products/refresh
Body: { product_ids: List[str] } or { category: str }
Response: { refreshed: int, failed: int }
```

**Analytics Endpoints**

```
GET /api/analytics/clicks
Query params: product_id, platform, start_date, end_date
Response: { clicks: List[ClickEvent], total: int }

GET /api/analytics/ctr
Query params: category, start_date, end_date
Response: { category: str, clicks: int, views: int, ctr: float }
```

**Admin Endpoints**

```
GET /api/admin/api-usage
Response: { apis: List[{ name: str, usage: dict, limit: dict }] }

GET /api/admin/cache-stats
Response: { size: int, hit_rate: float, staleness: dict }

GET /api/admin/sync-history
Response: { jobs: List[SyncResult] }

POST /api/admin/sync/trigger
Body: { category: str } (optional)
Response: { job_id: str, status: str }
```


## Data Models

### Product Model (Pydantic Schema)

```python
class BuyLinks(BaseModel):
    official: Optional[str] = None
    amazon: Optional[str] = None
    flipkart: Optional[str] = None

class Product(BaseModel):
    id: str = Field(alias="_id")
    product_id: str
    source: str
    name: str
    category: str
    subcategory: str
    price: float
    currency: str = "INR"
    rating: float
    review_count: Optional[int] = 0
    specs: Dict[str, Any]
    images: List[str]
    buyLinks: BuyLinks
    cached_at: datetime
    last_accessed: datetime
    access_count: int = 0
    ttl_hours: int = 24
    is_available: bool = True

class ProductSearchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    sort: Optional[str] = "relevance"  # relevance, price_asc, price_desc, rating
    page: int = 1
    limit: int = 20
```

### API Usage Model

```python
class APIUsage(BaseModel):
    api_name: str
    requests_per_second: int
    requests_per_day: int
    limit_per_second: int
    limit_per_day: int
    last_reset: datetime
    warnings: List[str]
```


## Implementation Strategy

### Phase 1: Foundation (Week 1)

**Tasks**:
1. Set up PostgreSQL tables and indexes
2. Implement Product_Cache with basic CRUD using SQLAlchemy
3. Create Product model and schemas
4. Add feature flag (USE_REAL_DATA) to config
5. Update existing /api/products endpoint to check flag

**Files to Create/Modify**:
- `backend/app/database/postgresql.py` (new)
- `backend/app/models/product.py` (update)
- `backend/app/config.py` (add feature flag)
- `backend/app/routes/products.py` (add flag check)
- `backend/alembic/versions/001_initial_tables.py` (migration)

### Phase 2: Amazon Integration (Week 2)

**Tasks**:
1. Implement Amazon PA-API client
2. Add authentication and request signing
3. Implement search_items and get_items
4. Create response parser and mapper
5. Add Rate_Limiter for Amazon
6. Write integration tests

**Files to Create**:
- `backend/app/services/amazon_api.py`
- `backend/app/services/rate_limiter.py`
- `backend/app/utils/amazon_auth.py`

### Phase 3: Flipkart Integration (Week 2)

**Tasks**:
1. Implement Flipkart Affiliate API client
2. Add authentication headers
3. Implement search and get_details
4. Create response parser
5. Extend Rate_Limiter for Flipkart
6. Write integration tests

**Files to Create**:
- `backend/app/services/flipkart_api.py`

### Phase 4: Core Services (Week 3)

**Tasks**:
1. Implement Product_Aggregator
2. Implement Product_Validator
3. Implement Fallback_Handler with circuit breaker
4. Update Product_Data_Service to orchestrate all components
5. Add comprehensive error handling

**Files to Create**:
- `backend/app/services/product_aggregator.py`
- `backend/app/services/product_validator.py`
- `backend/app/services/fallback_handler.py`
- `backend/app/services/product_data_service.py`


### Phase 5: Analytics & Tracking (Week 3)

**Tasks**:
1. Implement Buy_Link_Tracker
2. Create click tracking endpoints
3. Add analytics collection in MongoDB
4. Implement CTR calculation
5. Create admin analytics dashboard endpoints

**Files to Create**:
- `backend/app/services/buy_link_tracker.py`
- `backend/app/routes/analytics.py`

### Phase 6: Background Jobs (Week 4)

**Tasks**:
1. Implement Data_Sync_Job
2. Set up APScheduler or Celery
3. Add sync job history tracking
4. Create manual trigger endpoint
5. Add job monitoring and logging

**Files to Create**:
- `backend/app/jobs/data_sync.py`
- `backend/app/jobs/scheduler.py`

### Phase 7: Admin & Monitoring (Week 4)

**Tasks**:
1. Create admin endpoints for API usage
2. Add cache statistics endpoint
3. Implement manual refresh endpoint
4. Add health check endpoint
5. Create admin UI components (optional)

**Files to Create/Modify**:
- `backend/app/routes/admin.py` (new)
- `backend/app/routes/health.py` (new)

### Phase 8: Migration & Testing (Week 5)

**Tasks**:
1. Create migration script to seed initial data
2. Test with feature flag enabled
3. Performance testing and optimization
4. Update frontend to handle loading states
5. Add error messages for API failures
6. Gradual rollout with monitoring

**Files to Create**:
- `backend/scripts/seed_real_products.py`
- `backend/tests/integration/test_real_data.py`


## Configuration

### Environment Variables

```bash
# Feature Flag
USE_REAL_DATA=false

# Amazon PA-API
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1

# Flipkart Affiliate
FLIPKART_AFFILIATE_ID=your_affiliate_id
FLIPKART_AFFILIATE_TOKEN=your_token

# Cache Configuration
CACHE_TTL_HOURS=24
CACHE_MAX_SIZE_GB=10
CACHE_EVICTION_THRESHOLD=0.9

# Rate Limiting
AMAZON_RATE_LIMIT_PER_SECOND=1
AMAZON_RATE_LIMIT_PER_DAY=8640
FLIPKART_RATE_LIMIT_PER_SECOND=10
FLIPKART_RATE_LIMIT_PER_DAY=50000

# API Timeouts
API_TIMEOUT_SECONDS=10
API_RETRY_ATTEMPTS=3

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT_MINUTES=5

# Sync Job
SYNC_JOB_SCHEDULE="0 2 * * *"  # 2 AM daily
SYNC_JOB_BATCH_SIZE=100
```

## Error Handling

### Error Types and Responses

**API Errors**:
- 429 Too Many Requests → Use cached data, log warning
- 401 Unauthorized → Log error, check credentials, use fallback
- 500 Server Error → Retry with backoff, use fallback
- Timeout → Log timeout, use cached data

**Validation Errors**:
- Missing required fields → Exclude product, log details
- Invalid data types → Exclude product, log details
- Out of range values → Exclude product, log details

**Cache Errors**:
- MongoDB connection failure → Return error to frontend
- Cache full → Trigger LRU eviction
- Stale data → Attempt refresh, serve stale if refresh fails

## Security Considerations

1. **API Credentials**: Store in environment variables, never commit
2. **Rate Limiting**: Prevent quota exhaustion and unexpected costs
3. **Input Validation**: Sanitize all user inputs before API calls
4. **HTTPS Only**: All external API calls use HTTPS
5. **Affiliate Links**: Validate tracking parameters to prevent manipulation
6. **Admin Endpoints**: Require authentication and authorization
7. **Logging**: Sanitize logs to avoid exposing sensitive data

## Performance Optimization

1. **Caching**: 24-hour TTL reduces API calls by ~95%
2. **Indexing**: MongoDB indexes on category, subcategory, product_id
3. **Pagination**: Limit results to 20 per page
4. **Async Operations**: Use asyncio for concurrent API calls
5. **Connection Pooling**: Reuse HTTP connections
6. **CDN**: Cache product images on CDN
7. **Lazy Loading**: Load product details on demand

## Monitoring and Observability

**Key Metrics**:
- API call count per source
- Cache hit rate
- Average response time
- Error rate by type
- Sync job success rate
- Click-through rate by category

**Logging**:
- All API errors with context
- Rate limit warnings
- Validation failures
- Sync job results
- Circuit breaker state changes

**Alerts**:
- API quota approaching limit (80%)
- High error rate (>5%)
- Cache hit rate below threshold (<80%)
- Sync job failures
- Circuit breaker open state
