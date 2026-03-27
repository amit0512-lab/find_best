from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, desc, asc
from typing import List, Optional
from datetime import datetime

from app.schemas.product import ProductResponse, ProductFilter, ProductCreate, ProductUpdate
from app.models.product import Product
from app.database.session import get_db
from app.services.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    brand: Optional[str] = None,
    price_range: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "relevance",
    limit: int = Query(50, le=100),
    skip: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get products with filters"""
    query = select(Product)
    
    if category:
        query = query.where(Product.category.ilike(f"%{category}%"))
    if subcategory:
        query = query.where(Product.subcategory.ilike(f"%{subcategory}%"))
    if brand:
        query = query.where(Product.brand.ilike(f"%{brand}%"))
    if price_range:
        query = query.where(Product.price_range == price_range)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if min_rating is not None:
        query = query.where(Product.rating >= min_rating)
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.brand.ilike(f"%{search}%"),
                Product.category.ilike(f"%{search}%")
            )
        )
    
    if sort_by == "relevance":
        query = query.order_by(desc(Product.rating), desc(Product.reviews))
    elif sort_by == "price-low":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price-high":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort_by == "popular":
        query = query.order_by(desc(Product.reviews))
    else:
        query = query.order_by(desc(Product.rating), desc(Product.reviews))
        
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """Get single product by ID"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return product

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new product (Admin only)"""
    result = await db.execute(select(Product).where(Product.product_id == product.product_id))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Product already exists")
    
    product_dict = product.model_dump()
    new_product = Product(**product_dict)
    
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update product (Admin only)"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(product, key, value)
        
    await db.commit()
    await db.refresh(product)
    
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete product (Admin only)"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await db.delete(product)
    await db.commit()
    
    return None
