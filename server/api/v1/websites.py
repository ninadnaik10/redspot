from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.postgres import get_session
from models import User, Website, WebsiteCreate, WebsiteResponse
from .dependencies import get_current_user

router = APIRouter(prefix="/websites", tags=["websites"])


@router.post("", response_model=WebsiteResponse, status_code=status.HTTP_201_CREATED)
async def add_website(
    body: WebsiteCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    website = Website(user_id=user.id, name=body.name, url=body.url)
    session.add(website)
    await session.commit()
    await session.refresh(website)
    return _to_response(website)


@router.get("", response_model=list[WebsiteResponse])
async def list_websites(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Website).where(Website.user_id == user.id).order_by(Website.created_at.desc())
    )
    return [_to_response(w) for w in result.scalars().all()]


@router.get("/{website_id}", response_model=WebsiteResponse)
async def get_website(
    website_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    website = await session.get(Website, website_id)
    if not website or website.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Website not found")
    return _to_response(website)


@router.delete("/{website_id}")
async def delete_website(
    website_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    website = await session.get(Website, website_id)
    if not website or website.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Website not found")
    await session.delete(website)
    await session.commit()
    return {"ok": True}


def _to_response(website: Website) -> dict:
    return {
        "id": website.id,
        "site_id": website.site_id,
        "name": website.name,
        "url": website.url,
        "created_at": website.created_at.isoformat() if website.created_at else "",
    }