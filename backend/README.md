# FindBest Backend API

FastAPI backend for the FindBest product recommendation system.

## Features

- 🚀 FastAPI with async/await
- 🔐 JWT Authentication
- 📦 MongoDB with Motor (async driver)
- 🔍 Advanced product filtering & search
- ❤️ Favorites/Wishlist management
- 📚 Auto-generated API documentation (Swagger/ReDoc)
- 🔒 Password hashing with bcrypt
- ✅ Pydantic validation

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Linux/Mac:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Server

```bash
# Development mode with auto-reload
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products/` - Get products with filters
- `GET /api/products/{product_id}` - Get single product
- `POST /api/products/` - Create product (Auth required)
- `PUT /api/products/{product_id}` - Update product (Auth required)
- `DELETE /api/products/{product_id}` - Delete product (Auth required)

### Favorites
- `GET /api/favorites/` - Get user favorites
- `POST /api/favorites/{product_id}` - Add to favorites
- `DELETE /api/favorites/{product_id}` - Remove from favorites
- `GET /api/favorites/check/{product_id}` - Check if favorited

## Product Filters

Query parameters for `/api/products/`:
- `category` - Filter by category
- `subcategory` - Filter by subcategory
- `brand` - Filter by brand
- `price_range` - Filter by price range
- `min_price` - Minimum price
- `max_price` - Maximum price
- `min_rating` - Minimum rating
- `search` - Search in name, brand, category
- `sort_by` - Sort by: relevance, price-low, price-high, rating, popular
- `limit` - Results per page (max 100)
- `skip` - Pagination offset

## Example Requests

### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get Products
```bash
curl "http://localhost:8000/api/products/?category=Electronics&sort_by=rating&limit=10"
```

### Add to Favorites
```bash
curl -X POST "http://localhost:8000/api/favorites/lap-001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Seeding

To populate the database with initial products from your frontend mock data, create a seed script:

```bash
python scripts/seed_products.py
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── database/
│   │   └── mongodb.py       # MongoDB connection
│   ├── models/              # Database models
│   │   ├── user.py
│   │   └── product.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   └── product.py
│   ├── routes/              # API routes
│   │   ├── auth.py
│   │   ├── products.py
│   │   └── favorites.py
│   ├── services/            # Business logic
│   │   └── auth.py
│   └── utils/               # Utilities
│       └── security.py
├── requirements.txt
├── run.py
├── .env.example
└── README.md
```

## Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "run.py"]
```

### Using Gunicorn (Production)

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Testing

```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## License

MIT
