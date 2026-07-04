import asyncio
import logging
from contextlib import asynccontextmanager
from api.v1.router import api_router
from config import settings
from messaging import start_consumer, stop_consumer
from db.postgres import init_postgres, close_postgres
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_postgres()
    consumer_task = asyncio.create_task(start_consumer())
    yield
    stop_consumer()
    await consumer_task
    await close_postgres()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS", "GET", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(api_router)