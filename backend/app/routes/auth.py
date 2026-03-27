from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta

from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.models.user import User
from app.models.product import Product
from app.models.favorite import Favorite
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.database.session import get_db
from app.config import settings
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register new user"""
    
    result = await db.execute(select(User).where(User.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    result = await db.execute(select(User).where(User.username == user.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    setattr(new_user, "favorites", [])
    
    return new_user

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Get current user info"""
    result = await db.execute(
        select(Product.product_id)
        .join(Favorite, Favorite.product_id == Product.id)
        .where(Favorite.user_id == current_user.id)
    )
    favorites = list(result.scalars().all())
    
    setattr(current_user, "favorites", favorites)
    return current_user
