import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from datetime import datetime

# Your products data (copy from frontend mockProducts.js)
products_data = [
    {
        "product_id": "lap-001",
        "category": "1. Electronics",
        "subcategory": "Laptop",
        "name": "MacBook Pro 16\" M3 Max",
        "brand": "Premium (Apple/Dell/HP/Lenovo/Asus)",
        "price_range": "Above ₹1.2L + EMI filter",
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
            "processor": "Apple Silicon (M1–M4)",
            "ram": "32GB",
            "storage": "1TB SSD",
            "display": "16\" Liquid Retina XDR",
            "gpu": "Integrated (Intel/AMD/Apple)"
        }
    },
    # Add more products here...
]

async def seed_database():
    """Seed database with products"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("🌱 Starting database seeding...")
    
    # Clear existing products
    result = await db.products.delete_many({})
    print(f"🗑️  Deleted {result.deleted_count} existing products")
    
    # Insert products
    for product in products_data:
        product["created_at"] = datetime.utcnow()
        product["updated_at"] = datetime.utcnow()
    
    if products_data:
        result = await db.products.insert_many(products_data)
        print(f"✅ Inserted {len(result.inserted_ids)} products")
    
    # Create indexes
    await db.products.create_index("product_id", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("subcategory")
    await db.products.create_index("brand")
    await db.products.create_index("price")
    await db.products.create_index("rating")
    print("📇 Created indexes")
    
    # Create user indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    print("👤 Created user indexes")
    
    client.close()
    print("✨ Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
