# PickAI - Smart Shopping Assistant

AI-powered product recommendation platform with intelligent decision trees and glassmorphism UI.

## ✨ Features

- **Smart Decision Tree** - Guided product selection through intelligent questions
- **Glassmorphism UI** - Modern interface with smooth animations
- **40+ Products** - Across mobiles, laptops, tablets, audio, gaming & more
- **Favorites System** - Save and manage favorite products
- **Responsive Design** - Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite + Modern CSS  
**Backend:** FastAPI + PostgreSQL + SQLAlchemy  
**Database:** Alembic migrations + Async support

## 🚀 Quick Start

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python run.py
```

## 📱 Status

✅ **Completed:** UI, Decision Tree, Product Catalog, Favorites, Authentication  
🚧 **In Progress:** Real product APIs (Amazon, Flipkart), Caching, Analytics  
📋 **Planned:** Reviews, Price Comparison, ML Recommendations

## 🔧 Configuration

Create `backend/.env`:
```env
POSTGRESQL_URL=postgresql+asyncpg://user:password@localhost:5432/pickai_db
USE_REAL_DATA=false
```

See [Migration Guide](backend/MIGRATION_GUIDE.md) for database setup.

---

**Making smart shopping decisions easier with AI.**# find_best
