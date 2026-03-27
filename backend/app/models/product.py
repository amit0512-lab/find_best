from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.models import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    subcategory = Column(String, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, index=True, nullable=True)
    price_range = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    rating = Column(Float, nullable=False)
    reviews = Column(Integer, default=0)
    image = Column(String, nullable=False)
    buy_links = Column(JSON, nullable=False)
    specifications = Column(JSON, default={})
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
