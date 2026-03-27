from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.schemas.product import ProductResponse
from app.models.user import User
from app.models.product import Product
from app.models.favorite import Favorite
from app.database.session import get_db
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

@router.get("/", response_model=List[ProductResponse])
async def get_favorites(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Get user's favorite products"""
    result = await db.execute(
        select(Product)
        .join(Favorite, Favorite.product_id == Product.id)
        .where(Favorite.user_id == current_user.id)
    )
    products = result.scalars().all()
    return products

@router.post("/{product_id}", status_code=status.HTTP_200_OK)
async def add_favorite(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add product to favorites"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = await db.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .where(Favorite.product_id == product.id)
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        new_favorite = Favorite(user_id=current_user.id, product_id=product.id)
        db.add(new_favorite)
        await db.commit()
    
    return {"message": "Product added to favorites", "product_id": product_id}

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def remove_favorite(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove product from favorites"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    if product:
        result = await db.execute(
            select(Favorite)
            .where(Favorite.user_id == current_user.id)
            .where(Favorite.product_id == product.id)
        )
        favorite = result.scalar_one_or_none()
        
        if favorite:
            await db.delete(favorite)
            await db.commit()
    
    return {"message": "Product removed from favorites", "product_id": product_id}

@router.get("/check/{product_id}", response_model=dict)
async def check_favorite(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if product is in favorites"""
    result = await db.execute(select(Product).where(Product.product_id == product_id))
    product = result.scalar_one_or_none()
    
    is_favorite = False
    if product:
        result = await db.execute(
            select(Favorite)
            .where(Favorite.user_id == current_user.id)
            .where(Favorite.product_id == product.id)
        )
        favorite = result.scalar_one_or_none()
        if favorite:
            is_favorite = True
            
    return {"product_id": product_id, "is_favorite": is_favorite}
