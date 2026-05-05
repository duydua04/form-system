from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Type, TypeVar, List
from ...configs.db_config import Base

T = TypeVar('T', bound=Base)

class UserManagementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_account_by_email(self, model: Type[T], email: str) -> T | None:
        query = select(model).where(model.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_account(self, account: T) -> T:
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def count_accounts(self, model: Type[T]) -> int:
        query = select(func.count(model.id))
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_paginated_accounts(self, model: Type[T], offset: int, limit: int) -> List[T]:
        query = select(model).order_by(model.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())