import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import async_session
from app.models.product import Product
from app.models.user import User
from app.models.favorite import Favorite
from app.models import Base
from app.database.session import engine
from datetime import datetime

# Sample products data from frontend
products_data = [
    {
        "product_id": "lap-001",
        "category": "Electronics",
        "subcategory": "Laptop",
        "name": "MacBook Pro 16\" M3 Max",
        "brand": "Apple",
        "price_range": "Above ₹1.2L",
        "price": 349000,
        "rating": 4.9,
        "reviews": 2340,
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
        "buy_links": {
            "official": "https://www.apple.com/in/shop/buy-mac/macbook-pro",
            "amazon": "https://www.amazon.in/s?k=macbook+pro+16",
            "flipkart": "https://www.flipkart.com/search?q=macbook+pro+16"
        },
        "specifications": {
            "useCase": "Creative",
            "os": "macOS",
            "processor": "Apple Silicon M3 Max",
            "ram": "32GB",
            "storage": "1TB SSD",
            "display": "16\" Liquid Retina XDR"
        }
    },
    {
        "product_id": "lap-002",
        "category": "Electronics",
        "subcategory": "Laptop",
        "name": "Dell XPS 15 OLED",
        "brand": "Dell",
        "price_range": "₹80K-₹1.2L",
        "price": 185000,
        "rating": 4.7,
        "reviews": 1890,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=400",
        "buy_links": {
            "official": "https://www.dell.com/en-in/shop/laptops/xps-15/spd/xps-15-9530-laptop",
            "amazon": "https://www.amazon.in/s?k=dell+xps+15",
            "flipkart": "https://www.flipkart.com/search?q=dell+xps+15"
        },
        "specifications": {
            "useCase": "Creative",
            "os": "Windows",
            "processor": "Intel Core i7-13700H",
            "ram": "16GB",
            "storage": "512GB SSD",
            "display": "15.6\" OLED 3.5K"
        }
    },
    {
        "product_id": "phone-001",
        "category": "Mobile",
        "subcategory": "Smartphone",
        "name": "iPhone 15 Pro Max",
        "brand": "Apple",
        "price_range": "Above ₹80K",
        "price": 159900,
        "rating": 4.8,
        "reviews": 5670,
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=400",
        "buy_links": {
            "official": "https://www.apple.com/in/iphone-15-pro/",
            "amazon": "https://www.amazon.in/s?k=iphone+15+pro+max",
            "flipkart": "https://www.flipkart.com/search?q=iphone+15+pro+max"
        },
        "specifications": {
            "display": "6.7\" Super Retina XDR",
            "processor": "A17 Pro",
            "storage": "256GB",
            "camera": "48MP Triple Camera",
            "battery": "4441mAh"
        }
    },
    {
        "product_id": "phone-002",
        "category": "Mobile",
        "subcategory": "Smartphone",
        "name": "Samsung Galaxy S24 Ultra",
        "brand": "Samsung",
        "price_range": "Above ₹80K",
        "price": 129999,
        "rating": 4.6,
        "reviews": 4320,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
        "buy_links": {
            "official": "https://www.samsung.com/in/smartphones/galaxy-s24/",
            "amazon": "https://www.amazon.in/s?k=samsung+galaxy+s24+ultra",
            "flipkart": "https://www.flipkart.com/search?q=samsung+galaxy+s24+ultra"
        },
        "specifications": {
            "display": "6.8\" Dynamic AMOLED 2X",
            "processor": "Snapdragon 8 Gen 3",
            "storage": "256GB",
            "camera": "200MP Quad Camera",
            "battery": "5000mAh"
        }
    },
    {
        "product_id": "tab-001",
        "category": "Electronics",
        "subcategory": "Tablet",
        "name": "iPad Pro 12.9\" M2",
        "brand": "Apple",
        "price_range": "Above ₹80K",
        "price": 112900,
        "rating": 4.8,
        "reviews": 2890,
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400",
        "buy_links": {
            "official": "https://www.apple.com/in/ipad-pro/",
            "amazon": "https://www.amazon.in/s?k=ipad+pro+12.9",
            "flipkart": "https://www.flipkart.com/search?q=ipad+pro+12.9"
        },
        "specifications": {
            "display": "12.9\" Liquid Retina XDR",
            "processor": "Apple M2",
            "storage": "128GB",
            "camera": "12MP + 10MP Ultra Wide",
            "battery": "10 hours"
        }
    }
]

async def create_tables():
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("📋 Created all tables")

async def seed_database():
    """Seed database with products"""
    print("🌱 Starting PostgreSQL database seeding...")
    
    # Create tables first
    await create_tables()
    
    async with async_session() as session:
        # Clear existing products
        await session.execute("DELETE FROM products")
        await session.commit()
        print("🗑️  Cleared existing products")
        
        # Insert products
        for product_data in products_data:
            product = Product(
                product_id=product_data["product_id"],
                category=product_data["category"],
                subcategory=product_data["subcategory"],
                name=product_data["name"],
                brand=product_data["brand"],
                price_range=product_data["price_range"],
                price=product_data["price"],
                rating=product_data["rating"],
                reviews=product_data["reviews"],
                image=product_data["image"],
                buy_links=product_data["buy_links"],
                specifications=product_data["specifications"]
            )
            session.add(product)
        
        await session.commit()
        print(f"✅ Inserted {len(products_data)} products")
    
    print("✨ PostgreSQL database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())