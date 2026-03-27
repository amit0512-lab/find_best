# Implementation Tasks

## Phase 1: Foundation Setup

### Task 1.1: PostgreSQL Tables and Indexes Setup
**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Set up PostgreSQL database with tables, indexes, and constraints for product caching, API usage tracking, and analytics.

**Acceptance Criteria**:
- [ ] Create `products_cache` table with JSONB columns for specs, images, buy_links
- [ ] Create indexes on product_id (unique), category, subcategory, cached_at, last_accessed
- [ ] Create `api_usage` table for rate limiting tracking
- [ ] Create `click_analytics` table for buy link tracking
- [ ] Create `sync_jobs` table for background job history
- [ ] Create `circuit_breaker_state` table for API health tracking
- [ ] Set up Alembic for database migrations
- [ ] Create initial migration script
- [ ] Verify all tables and indexes are created

**Files to Create/Modify**:
- `backend/app/database/postgresql.py` (new)
- `backend/alembic.ini` (new)
- `backend/alembic/env.py` (new)
- `backend/alembic/versions/001_initial_tables.py` (new)
- `backend/requirements.txt` (add sqlalchemy, alembic, psycopg2-binary)

**Dependencies**: None

---

### Task 1.2: Product Cache Service with SQLAlchemy
**Status**: pending
**Priority**: high
**Estimated Effort**: 5 hours

**Description**: Implement Product_Cache service using SQLAlchemy ORM for storing and retrieving cached product data with TTL management.

**Acceptance Criteria**:
- [ ] Set up SQLAlchemy models for products_cache table
- [ ] Implement get_product(product_id) method with async support
- [ ] Implement get_products_by_category(category, filters) method
- [ ] Implement save_product(product) method with timestamp
- [ ] Implement check_cache_freshness(product_id) method
- [ ] Implement LRU eviction when storage exceeds 90%
- [ ] Add cache statistics methods (hit rate, size, staleness)
- [ ] Handle JSONB fields for specs, images, buy_links
- [ ] Write unit tests for all methods

**Files to Create/Modify**:
- `backend/app/models/product_cache.py` (new - SQLAlchemy model)
- `backend/app/services/product_cache.py` (new)
- `backend/tests/test_product_cache.py` (new)

**Dependencies**: Task 1.1


---

### Task 1.3: Update Product Models and Schemas
**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Update Product model to include caching metadata and support both mock and real data sources.

**Acceptance Criteria**:
- [ ] Add source field (mock, amazon, flipkart, aggregated)
- [ ] Add cached_at, last_accessed, access_count fields
- [ ] Add ttl_hours and is_available fields
- [ ] Update BuyLinks schema to support tracking parameters
- [ ] Ensure backward compatibility with existing mock data
- [ ] Add validation for all new fields
- [ ] Update API response schemas

**Files to Create/Modify**:
- `backend/app/models/product.py` (update)
- `backend/app/schemas/product.py` (update)

**Dependencies**: None

---

### Task 1.4: Feature Flag Configuration
**Status**: pending
**Priority**: high
**Estimated Effort**: 1 hour

**Description**: Add USE_REAL_DATA feature flag and related configuration for switching between mock and real data.

**Acceptance Criteria**:
- [ ] Add USE_REAL_DATA environment variable to config
- [ ] Add cache configuration (TTL, max size, eviction threshold)
- [ ] Add API timeout and retry settings
- [ ] Add rate limit configurations for each API
- [ ] Add circuit breaker settings
- [ ] Update .env.example with all new variables
- [ ] Add configuration validation on startup

**Files to Create/Modify**:
- `backend/app/config.py` (update)
- `backend/.env.example` (update)

**Dependencies**: None

---

### Task 1.5: Update Products Route with Feature Flag
**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Modify existing /api/products endpoint to check feature flag and route to appropriate data source.

**Acceptance Criteria**:
- [ ] Check USE_REAL_DATA flag in products route
- [ ] If false, serve from mock data (existing behavior)
- [ ] If true, call Product_Data_Service
- [ ] Maintain same response format for both modes
- [ ] Add logging for which mode is active
- [ ] Update API documentation

**Files to Create/Modify**:
- `backend/app/routes/products.py` (update)

**Dependencies**: Task 1.3, Task 1.4

---

## Phase 2: Amazon PA-API Integration

### Task 2.1: Amazon Authentication and Request Signing
**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Implement AWS Signature Version 4 authentication for Amazon PA-API requests.

**Acceptance Criteria**:
- [ ] Implement AWS SigV4 signing algorithm
- [ ] Create sign_request() method with HMAC-SHA256
- [ ] Add access key, secret key, partner tag to config
- [ ] Handle authentication errors gracefully
- [ ] Add request timestamp and headers
- [ ] Write unit tests for signing logic

**Files to Create/Modify**:
- `backend/app/utils/amazon_auth.py` (new)
- `backend/tests/test_amazon_auth.py` (new)

**Dependencies**: Task 1.4


---

### Task 2.2: Amazon PA-API Client Implementation
**Status**: pending
**Priority**: high
**Estimated Effort**: 6 hours

**Description**: Create Amazon PA-API client with search_items and get_items operations.

**Acceptance Criteria**:
- [ ] Implement search_items(keywords, category) method
- [ ] Implement get_items(asin_list) method
- [ ] Implement get_variations(asin) method
- [ ] Parse API responses and extract product data
- [ ] Map Amazon fields to Product model (ASIN→product_id, ItemInfo→name, etc.)
- [ ] Handle API errors (429, 401, 500, timeout)
- [ ] Add retry logic with exponential backoff
- [ ] Write integration tests with mock responses

**Files to Create/Modify**:
- `backend/app/services/amazon_api.py` (new)
- `backend/tests/test_amazon_api.py` (new)

**Dependencies**: Task 2.1, Task 1.3

---

### Task 2.3: Rate Limiter for Amazon with PostgreSQL
**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Implement rate limiting for Amazon PA-API using token bucket algorithm with PostgreSQL backend.

**Acceptance Criteria**:
- [ ] Implement token bucket algorithm
- [ ] Track requests per second (1/sec limit)
- [ ] Track requests per day (8640/day limit)
- [ ] Log warning at 80% capacity
- [ ] Return false when limit exceeded
- [ ] Store usage data in PostgreSQL api_usage table
- [ ] Reset counters according to API schedule
- [ ] Expose get_usage_stats() method
- [ ] Use database transactions for atomic updates

**Files to Create/Modify**:
- `backend/app/models/api_usage.py` (new - SQLAlchemy model)
- `backend/app/services/rate_limiter.py` (new)
- `backend/tests/test_rate_limiter.py` (new)

**Dependencies**: Task 1.1

---

## Phase 3: Flipkart Affiliate API Integration

### Task 3.1: Flipkart API Client Implementation
**Status**: pending
**Priority**: high
**Estimated Effort**: 5 hours

**Description**: Create Flipkart Affiliate API client with search and product details operations.

**Acceptance Criteria**:
- [ ] Implement search_products(query, category) method
- [ ] Implement get_product_details(product_id) method
- [ ] Add Fk-Affiliate-Id and Fk-Affiliate-Token headers
- [ ] Parse API responses and extract product data
- [ ] Map Flipkart fields to Product model
- [ ] Handle API errors gracefully
- [ ] Add retry logic
- [ ] Write integration tests

**Files to Create/Modify**:
- `backend/app/services/flipkart_api.py` (new)
- `backend/tests/test_flipkart_api.py` (new)

**Dependencies**: Task 1.3, Task 1.4

---

### Task 3.2: Extend Rate Limiter for Flipkart
**Status**: pending
**Priority**: medium
**Estimated Effort**: 2 hours

**Description**: Add Flipkart rate limiting to existing Rate_Limiter service.

**Acceptance Criteria**:
- [ ] Add Flipkart limits (10/sec, 50000/day)
- [ ] Support multiple API sources in rate limiter
- [ ] Track usage separately per API
- [ ] Update usage stats to include Flipkart
- [ ] Test rate limiting for both APIs

**Files to Create/Modify**:
- `backend/app/services/rate_limiter.py` (update)
- `backend/tests/test_rate_limiter.py` (update)

**Dependencies**: Task 2.3, Task 3.1


---

## Phase 4: Core Services

### Task 4.1: Product Aggregator Service
**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Implement service to merge product data from multiple sources intelligently.

**Acceptance Criteria**:
- [ ] Implement aggregate_product(sources) method
- [ ] Use most recent data based on cached_at timestamp
- [ ] Prefer official prices over marketplace
- [ ] Combine specs from all sources
- [ ] Keep all buy links from different sources
- [ ] Use highest rating when multiple sources available
- [ ] Handle conflicts in product data
- [ ] Write unit tests with various scenarios

**Files to Create/Modify**:
- `backend/app/services/product_aggregator.py` (new)
- `backend/tests/test_product_aggregator.py` (new)

**Dependencies**: Task 1.3

---

### Task 4.2: Product Validator Service
**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Implement validation service to ensure product data quality.

**Acceptance Criteria**:
- [ ] Validate name (non-empty, max 200 chars)
- [ ] Validate price (positive number)
- [ ] Validate rating (0-5 range)
- [ ] Validate category against predefined list
- [ ] Validate images (at least 1 valid URL)
- [ ] Validate buyLinks (at least 1 non-empty)
- [ ] Validate specs (at least 3 key-value pairs)
- [ ] Return validation errors with details
- [ ] Log validation failures
- [ ] Write comprehensive unit tests

**Files to Create/Modify**:
- `backend/app/services/product_validator.py` (new)
- `backend/tests/test_product_validator.py` (new)

**Dependencies**: Task 1.3

---

### Task 4.3: Fallback Handler with Circuit Breaker
**Status**: pending
**Priority**: high
**Estimated Effort**: 5 hours

**Description**: Implement fallback mechanism with circuit breaker pattern for API failures.

**Acceptance Criteria**:
- [ ] Implement circuit breaker with CLOSED, OPEN, HALF_OPEN states
- [ ] Set failure threshold to 5 consecutive failures
- [ ] Set open duration to 5 minutes
- [ ] Implement handle_api_failure() method
- [ ] Implement get_fallback_data() to serve cached data
- [ ] Track circuit state per API
- [ ] Log all state transitions
- [ ] Automatically recover when API is healthy
- [ ] Write unit tests for all states

**Files to Create/Modify**:
- `backend/app/services/fallback_handler.py` (new)
- `backend/tests/test_fallback_handler.py` (new)

**Dependencies**: Task 1.2

---

### Task 4.4: Product Data Service Orchestrator
**Status**: pending
**Priority**: high
**Estimated Effort**: 6 hours

**Description**: Create main orchestrator service that coordinates all components.

**Acceptance Criteria**:
- [ ] Implement get_products(category, filters) method
- [ ] Implement get_product_by_id(product_id) method
- [ ] Implement search_products(query, filters) method
- [ ] Check cache before calling APIs
- [ ] Use Rate_Limiter before API calls
- [ ] Aggregate data from multiple sources
- [ ] Validate products before caching
- [ ] Use Fallback_Handler on errors
- [ ] Update access_count and last_accessed
- [ ] Return paginated results
- [ ] Write integration tests

**Files to Create/Modify**:
- `backend/app/services/product_data_service.py` (new)
- `backend/tests/test_product_data_service.py` (new)

**Dependencies**: Task 1.2, Task 2.2, Task 3.1, Task 4.1, Task 4.2, Task 4.3


---

## Phase 5: Analytics and Tracking

### Task 5.1: Buy Link Tracker Service with PostgreSQL
**Status**: pending
**Priority**: medium
**Estimated Effort**: 4 hours

**Description**: Implement service to generate affiliate links and track clicks using PostgreSQL.

**Acceptance Criteria**:
- [ ] Implement generate_amazon_link(asin, partner_tag) method
- [ ] Implement generate_flipkart_link(product_id, affiliate_id) method
- [ ] Implement add_tracking_params(url, tracking_id) method
- [ ] Generate unique tracking IDs for each click
- [ ] Implement log_click(product_id, platform) method
- [ ] Store click events in PostgreSQL click_analytics table
- [ ] Implement get_click_stats(product_id) method
- [ ] Implement get_ctr_by_category() method using SQL aggregations
- [ ] Write unit tests

**Files to Create/Modify**:
- `backend/app/models/click_analytics.py` (new - SQLAlchemy model)
- `backend/app/services/buy_link_tracker.py` (new)
- `backend/tests/test_buy_link_tracker.py` (new)

**Dependencies**: Task 1.1

---

### Task 5.2: Analytics API Endpoints
**Status**: pending
**Priority**: medium
**Estimated Effort**: 3 hours

**Description**: Create REST endpoints for analytics and click tracking.

**Acceptance Criteria**:
- [ ] Create GET /api/analytics/clicks endpoint
- [ ] Support filtering by product_id, platform, date range
- [ ] Create GET /api/analytics/ctr endpoint
- [ ] Support filtering by category, date range
- [ ] Return paginated results
- [ ] Add proper error handling
- [ ] Add API documentation
- [ ] Write integration tests

**Files to Create/Modify**:
- `backend/app/routes/analytics.py` (new)
- `backend/tests/test_analytics_routes.py` (new)

**Dependencies**: Task 5.1

---

### Task 5.3: Update Product Routes with Click Tracking
**Status**: pending
**Priority**: medium
**Estimated Effort**: 2 hours

**Description**: Integrate Buy_Link_Tracker into product endpoints to track clicks.

**Acceptance Criteria**:
- [ ] Add tracking parameters to all buy links in responses
- [ ] Create POST /api/products/{id}/track-click endpoint
- [ ] Log clicks when users click buy buttons
- [ ] Return tracking statistics in product details
- [ ] Update frontend to call track-click endpoint
- [ ] Test click tracking flow end-to-end

**Files to Create/Modify**:
- `backend/app/routes/products.py` (update)
- `src/components/ProductCard.jsx` (update)

**Dependencies**: Task 5.1

---

## Phase 6: Background Jobs

### Task 6.1: Data Sync Job Implementation with PostgreSQL
**Status**: pending
**Priority**: high
**Estimated Effort**: 5 hours

**Description**: Create background job to refresh cached product data periodically using PostgreSQL.

**Acceptance Criteria**:
- [ ] Implement run_sync_job() method
- [ ] Implement sync_category(category) method
- [ ] Implement sync_product(product_id) method
- [ ] Prioritize products by last_accessed (recent first) using SQL ORDER BY
- [ ] Check cached_at age and refresh if > TTL
- [ ] Update price, availability, rating
- [ ] Log sync statistics (updated, failed, API calls)
- [ ] Implement retry with exponential backoff
- [ ] Store sync job history in PostgreSQL sync_jobs table
- [ ] Complete within 2 hours for 10k products
- [ ] Use batch updates for efficiency
- [ ] Write unit tests

**Files to Create/Modify**:
- `backend/app/models/sync_jobs.py` (new - SQLAlchemy model)
- `backend/app/jobs/data_sync.py` (new)
- `backend/tests/test_data_sync.py` (new)

**Dependencies**: Task 4.4


---

### Task 6.2: Job Scheduler Setup
**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Set up APScheduler or Celery for running background jobs.

**Acceptance Criteria**:
- [ ] Install and configure APScheduler or Celery
- [ ] Schedule Data_Sync_Job to run daily at 2 AM
- [ ] Add job monitoring and logging
- [ ] Handle job failures gracefully
- [ ] Prevent concurrent job executions
- [ ] Add configuration for job schedule
- [ ] Test job execution

**Files to Create/Modify**:
- `backend/app/jobs/scheduler.py` (new)
- `backend/requirements.txt` (update)
- `backend/app/main.py` (update to start scheduler)

**Dependencies**: Task 6.1

---

## Phase 7: Admin and Monitoring

### Task 7.1: Admin API Endpoints
**Status**: pending
**Priority**: medium
**Estimated Effort**: 4 hours

**Description**: Create admin endpoints for monitoring and management.

**Acceptance Criteria**:
- [ ] Create GET /api/admin/api-usage endpoint
- [ ] Create GET /api/admin/cache-stats endpoint
- [ ] Create GET /api/admin/sync-history endpoint
- [ ] Create POST /api/admin/sync/trigger endpoint
- [ ] Create POST /api/admin/products/refresh endpoint
- [ ] Add authentication/authorization for admin routes
- [ ] Return comprehensive statistics
- [ ] Add API documentation
- [ ] Write integration tests

**Files to Create/Modify**:
- `backend/app/routes/admin.py` (new)
- `backend/tests/test_admin_routes.py` (new)

**Dependencies**: Task 4.4, Task 6.1

---

### Task 7.2: Health Check Endpoint with PostgreSQL
**Status**: pending
**Priority**: medium
**Estimated Effort**: 2 hours

**Description**: Create health check endpoint showing status of all integrations including PostgreSQL.

**Acceptance Criteria**:
- [ ] Create GET /api/health endpoint
- [ ] Check PostgreSQL connection status
- [ ] Check Amazon PA-API status (circuit breaker state from DB)
- [ ] Check Flipkart API status (circuit breaker state from DB)
- [ ] Return overall health status
- [ ] Include response times for each service
- [ ] Add detailed error messages when unhealthy
- [ ] Write tests

**Files to Create/Modify**:
- `backend/app/routes/health.py` (new)
- `backend/tests/test_health_routes.py` (new)

**Dependencies**: Task 4.3

---

## Phase 8: Migration and Testing

### Task 8.1: Initial Data Seeding Script
**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Create script to seed Product_Cache with initial product data.

**Acceptance Criteria**:
- [ ] Fetch products for all supported categories
- [ ] Use both Amazon and Flipkart APIs
- [ ] Aggregate and validate products
- [ ] Store in Product_Cache
- [ ] Log seeding progress and statistics
- [ ] Handle API rate limits during seeding
- [ ] Support resuming from failures
- [ ] Seed at least 100 products per category
- [ ] Add command-line arguments for categories

**Files to Create/Modify**:
- `backend/scripts/seed_real_products.py` (new)

**Dependencies**: Task 4.4


---

### Task 8.2: Integration Testing
**Status**: pending
**Priority**: high
**Estimated Effort**: 6 hours

**Description**: Comprehensive integration testing with real data mode enabled.

**Acceptance Criteria**:
- [ ] Test product search with real data
- [ ] Test product retrieval by ID
- [ ] Test filtering and sorting
- [ ] Test pagination
- [ ] Test cache hit/miss scenarios
- [ ] Test rate limiting behavior
- [ ] Test fallback when APIs fail
- [ ] Test circuit breaker transitions
- [ ] Test data aggregation from multiple sources
- [ ] Test validation of incomplete products
- [ ] Verify response format matches mock data
- [ ] Write comprehensive test suite

**Files to Create/Modify**:
- `backend/tests/integration/test_real_data.py` (new)
- `backend/tests/integration/test_end_to_end.py` (new)

**Dependencies**: Task 8.1

---

### Task 8.3: Frontend Loading States
**Status**: pending
**Priority**: medium
**Estimated Effort**: 3 hours

**Description**: Update frontend to handle loading states and errors for real data.

**Acceptance Criteria**:
- [ ] Show loading skeleton while fetching products
- [ ] Display error messages when API fails
- [ ] Show staleness indicator for cached data
- [ ] Add retry button on errors
- [ ] Handle empty results gracefully
- [ ] Update ProductList component
- [ ] Update ProductCard component
- [ ] Test with slow network conditions

**Files to Create/Modify**:
- `src/components/ProductList.jsx` (update)
- `src/components/ProductCard.jsx` (update)
- `decision_tree.jsx` (update)

**Dependencies**: Task 1.5

---

### Task 8.4: Performance Testing and Optimization
**Status**: pending
**Priority**: medium
**Estimated Effort**: 4 hours

**Description**: Test performance and optimize for production workload.

**Acceptance Criteria**:
- [ ] Load test with 100 concurrent users
- [ ] Verify 95th percentile response time < 500ms
- [ ] Verify cache hit rate > 80%
- [ ] Optimize slow queries
- [ ] Add database indexes if needed
- [ ] Profile API calls and optimize
- [ ] Test with 10,000 cached products
- [ ] Document performance metrics

**Files to Create/Modify**:
- `backend/tests/performance/test_load.py` (new)
- Performance report document

**Dependencies**: Task 8.2

---

### Task 8.5: Documentation and Deployment Guide
**Status**: pending
**Priority**: medium
**Estimated Effort**: 3 hours

**Description**: Create comprehensive documentation for deployment and usage.

**Acceptance Criteria**:
- [ ] Document API credential setup (Amazon, Flipkart)
- [ ] Document environment variable configuration
- [ ] Create deployment guide
- [ ] Document feature flag usage
- [ ] Document admin endpoints
- [ ] Create troubleshooting guide
- [ ] Document monitoring and alerts
- [ ] Update README with new features

**Files to Create/Modify**:
- `backend/DEPLOYMENT.md` (new)
- `backend/API_CREDENTIALS_SETUP.md` (new)
- `backend/README.md` (update)

**Dependencies**: All previous tasks

---

## Summary

**Total Tasks**: 28
**Estimated Total Effort**: 97 hours (~12 working days)

**Phase Breakdown**:
- Phase 1 (Foundation): 5 tasks, 13 hours (PostgreSQL setup adds 2 hours)
- Phase 2 (Amazon): 3 tasks, 14 hours
- Phase 3 (Flipkart): 2 tasks, 7 hours
- Phase 4 (Core Services): 4 tasks, 18 hours
- Phase 5 (Analytics): 3 tasks, 9 hours
- Phase 6 (Background Jobs): 2 tasks, 8 hours
- Phase 7 (Admin): 2 tasks, 6 hours
- Phase 8 (Migration): 5 tasks, 22 hours

**Technology Stack**:
- Database: PostgreSQL with SQLAlchemy ORM
- Migrations: Alembic
- Backend: FastAPI with async support
- JSONB columns for flexible data (specs, images, buy_links)
- Indexes for fast queries on category, price, rating

**Critical Path**: 
Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2 → Task 4.4 → Task 8.1 → Task 8.2

**Next Steps**:
1. Review and approve task breakdown
2. Set up PostgreSQL database (local or cloud)
3. Set up development environment with API credentials
4. Start with Phase 1 tasks (PostgreSQL setup)
5. Complete each phase before moving to next
6. Test thoroughly at each phase
7. Deploy with feature flag disabled initially
8. Gradually enable for testing
9. Monitor and optimize based on real usage
