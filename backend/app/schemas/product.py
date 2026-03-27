from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class BuyLinks(BaseModel):
    official: str
    amazon: str
    flipkart: str

class ProductBase(BaseModel):
    product_id: str
    category: str
    subcategory: str
    name: str
    brand: Optional[str] = None
    price_range: Optional[str] = None
    price: float
    rating: float
    reviews: int
    image: str
    buy_links: BuyLinks
    specifications: Dict[str, str] = {}

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    image: Optional[str] = None
    buy_links: Optional[BuyLinks] = None
    specifications: Optional[Dict[str, str]] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductFilter(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    price_range: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "relevance"  # relevance, price-low, price-high, rating, popular
    limit: int = 50
    skip: int = 0
