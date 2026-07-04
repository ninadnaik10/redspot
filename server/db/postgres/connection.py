from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config import settings

_engine = None
_session_factory = None


def _build_url() -> str:
    return (
        f"postgresql+asyncpg://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_database}"
    )


async def init_postgres():
    global _engine, _session_factory
    _engine = create_async_engine(_build_url())
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)


async def close_postgres():
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None


async def get_session() -> AsyncSession:
    async with _session_factory() as session:
        yield session