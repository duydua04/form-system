from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Type, TypeVar, Optional
from ...configs.db_config import Base

T = TypeVar('T', bound=Base)

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_account_by_email(self, model: Type[T], email: str) -> Optional[T]:
        query = select(model).where(model.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_account_by_id(self, model: Type[T], account_id: int) -> Optional[T]:
        return await self.db.get(model, account_id)

    async def create_account(self, account: T) -> T:
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account
