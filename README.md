# PickAI - Smart Shopping Assistant

An AI-powered product recommendation platform that helps users find the perfect products through intelligent decision trees and personalized recommendations.

## 🚀 Features

### Frontend (React + Vite)
- **Smart Decision Tree**: Guided product selection through intelligent questions
- **Glassmorphism UI**: Modern, beautiful interface with smooth animations
- **Category Navigation**: Bento grid layout for easy browsing
- **Product Filtering**: Advanced filters with compatibility rules
- **Favorites System**: Save and manage favorite products
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modal System**: How It Works and About modals with detailed information

### Backend (FastAPI + PostgreSQL)
- **RESTful API**: Fast and efficient product data management
- **PostgreSQL Database**: Scalable database with proper indexing
- **User Authentication**: Secure user management system
- **Favorites API**: Backend support for user favorites
- **Real Product Integration**: Ready for Amazon PA-API and Flipkart API
- **Caching System**: Optimized performance with intelligent caching
- **Migration System**: Alembic for database version control

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Modern CSS** with Glassmorphism effects
- **Responsive Design** with mobile-first approach
- **Component Architecture** for maintainability

### Backend
- **FastAPI** for high-performance API
- **PostgreSQL** with SQLAlchemy ORM
- **Alembic** for database migrations
- **Async/Await** for optimal performance
- **Pydantic** for data validation

## 📦 Project Structure

```
├── frontend/                 # React frontend application
├── backend/                  # FastAPI backend application
│   ├── app/                 # Main application code
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── alembic/             # Database migrations
│   └── scripts/             # Utility scripts
├── src/                     # Frontend source code
│   ├── components/          # React components
│   └── data/               # Mock data and categories
└── static/                  # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 12+

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database (see MIGRATION_GUIDE.md)
alembic upgrade head

# Start server
python run.py
```

## 📱 Current Features

### ✅ Completed
- Modern glassmorphism UI design
- Complete decision tree navigation
- Product catalog with 40+ products
- Category-based filtering system
- Favorites functionality
- Responsive mobile design
- PostgreSQL database setup
- User authentication system
- RESTful API endpoints

### 🚧 In Progress
- Real product data integration (Amazon PA-API, Flipkart API)
- Advanced caching system
- Analytics and click tracking
- Background job processing

### 📋 Planned
- User reviews and ratings
- Price comparison features
- Advanced recommendation engine
- Mobile app (React Native)

## 🎨 Design Features

- **Glassmorphism Effects**: Beautiful frosted glass appearance
- **Gradient Backgrounds**: Dynamic animated gradients
- **Smooth Animations**: 60fps transitions and hover effects
- **Mobile-First**: Optimized for all screen sizes
- **Accessibility**: WCAG compliant design patterns

## 📊 Product Categories

- **Mobile Phones**: Smartphones and Feature Phones
- **Laptops**: Gaming, Business, and Student laptops
- **Tablets**: Android and iPad options
- **Audio**: Headphones and Earbuds
- **Gaming**: Consoles and Accessories
- **Cameras**: DSLR and Mirrorless
- **Home Appliances**: AC, Air Purifiers, Vacuum Cleaners
- **Kitchen**: Refrigerators, Microwaves, Mixers
- **Automobiles**: Cars, Bikes, Scooters
- **Sports**: Cricket, Football, Gym Equipment
- **Music**: Instruments and Audio Equipment
- **Fragrances**: Perfumes and Colognes

## 🔧 Configuration

### Environment Variables
```env
# Database
POSTGRESQL_URL=postgresql+asyncpg://user:password@localhost:5432/pickai_db

# Feature Flags
USE_REAL_DATA=false

# API Keys (when ready)
AMAZON_ACCESS_KEY=your_key
FLIPKART_AFFILIATE_ID=your_id
```

## 📚 Documentation

- [Database Setup Guide](backend/DATABASE_SETUP.md)
- [Migration Guide](backend/MIGRATION_GUIDE.md)
- [API Documentation](backend/README.md)
- [Frontend Checklist](FRONTEND_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

### Phase 1: Foundation (Completed)
- ✅ UI/UX Design and Implementation
- ✅ Database Architecture
- ✅ Basic API Endpoints
- ✅ Authentication System

### Phase 2: Real Data Integration (In Progress)
- 🚧 Amazon PA-API Integration
- 🚧 Flipkart API Integration
- 🚧 Caching and Performance
- 🚧 Analytics System

### Phase 3: Advanced Features (Planned)
- 📋 Machine Learning Recommendations
- 📋 Price Tracking and Alerts
- 📋 User Reviews System
- 📋 Mobile Application

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**PickAI** - Making smart shopping decisions easier with AI-powered recommendations.