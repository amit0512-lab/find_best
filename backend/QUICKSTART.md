# FastAPI Backend - Quick Start Guide

## 🚀 Setup in 5 Minutes

### Option 1: Local Setup (Recommended for Development)

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Install & Start MongoDB

**Using Docker (Easiest):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Or Download MongoDB:**
- Windows: https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

#### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default settings work for local development)
```

#### Step 4: Seed Database (Optional)
```bash
python scripts/seed_products.py
```

#### Step 5: Run the Server
```bash
python run.py
```

✅ Backend running at: **http://localhost:8000**
📚 API Docs: **http://localhost:8000/docs**

---

### Option 2: Docker Setup (Production-Ready)

```bash
cd backend
docker-compose up -d
```

That's it! Everything runs in containers.

---

## 🧪 Test the API

### 1. Check Health
```bash
curl http://localhost:8000/health
```

### 2. Register a User
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `access_token` from response.

### 4. Get Products
```bash
curl "http://localhost:8000/api/products/?limit=5"
```

### 5. Add to Favorites (with token)
```bash
curl -X POST "http://localhost:8000/api/favorites/lap-001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔗 Connect Frontend to Backend

Update your React app to use the API:

### 1. Install Axios
```bash
cd ..  # Go back to frontend
npm install axios
```

### 2. Create API Client

Create `src/api/client.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 3. Create API Services

Create `src/api/products.js`:
```javascript
import apiClient from './client';

export const getProducts = async (filters = {}) => {
  const response = await apiClient.get('/api/products/', { params: filters });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await apiClient.get(`/api/products/${productId}`);
  return response.data;
};
```

Create `src/api/auth.js`:
```javascript
import apiClient from './client';

export const signup = async (userData) => {
  const response = await apiClient.post('/api/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
```

Create `src/api/favorites.js`:
```javascript
import apiClient from './client';

export const getFavorites = async () => {
  const response = await apiClient.get('/api/favorites/');
  return response.data;
};

export const addFavorite = async (productId) => {
  const response = await apiClient.post(`/api/favorites/${productId}`);
  return response.data;
};

export const removeFavorite = async (productId) => {
  const response = await apiClient.delete(`/api/favorites/${productId}`);
  return response.data;
};
```

### 4. Update ProductList Component

Replace mock data with API call:
```javascript
import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';

const ProductList = ({ filters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (loading) return <div>Loading...</div>;

  return (
    // Your existing ProductList JSX
  );
};
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/products/` | Get products | ❌ |
| GET | `/api/products/{id}` | Get product | ❌ |
| POST | `/api/products/` | Create product | ✅ |
| PUT | `/api/products/{id}` | Update product | ✅ |
| DELETE | `/api/products/{id}` | Delete product | ✅ |
| GET | `/api/favorites/` | Get favorites | ✅ |
| POST | `/api/favorites/{id}` | Add favorite | ✅ |
| DELETE | `/api/favorites/{id}` | Remove favorite | ✅ |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
docker ps  # If using Docker
# Or
mongosh  # If installed locally
```

### Port Already in Use
```bash
# Change port in .env
PORT=8001
```

### CORS Error
```bash
# Add your frontend URL to .env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📚 Next Steps

1. ✅ Backend is running
2. 🔗 Connect frontend to backend
3. 🎨 Add authentication UI
4. 📊 Implement analytics
5. 🚀 Deploy to production

---

## 🎯 Production Deployment

### Deploy to Railway/Render/Heroku
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy!

### Environment Variables for Production
```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
SECRET_KEY=generate-strong-random-key
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

Need help? Check the full README.md or API docs at `/docs`
