from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("/", response_model=list[schemas.RecipeOut])
def list_recipes(
    search: str = Query(None),
    category: models.RecipeCategory = Query(None),
    is_favorite: bool = Query(None),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.Recipe).filter(models.Recipe.user_id == user.id)
    if search:
        q = q.filter(models.Recipe.name.ilike(f"%{search}%"))
    if category:
        q = q.filter(models.Recipe.category == category)
    if is_favorite is not None:
        q = q.filter(models.Recipe.is_favorite == is_favorite)
    return q.order_by(models.Recipe.name).all()


@router.post("/", response_model=schemas.RecipeOut, status_code=201)
def create_recipe(
    data: schemas.RecipeCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = models.Recipe(**data.model_dump(), user_id=user.id)
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/{recipe_id}", response_model=schemas.RecipeOut)
def get_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_owned(recipe_id, user.id, db)
    return recipe


@router.put("/{recipe_id}", response_model=schemas.RecipeOut)
def update_recipe(
    recipe_id: str,
    data: schemas.RecipeUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_owned(recipe_id, user.id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(recipe, field, value)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_owned(recipe_id, user.id, db)
    db.delete(recipe)
    db.commit()


@router.post("/{recipe_id}/favorite", response_model=schemas.RecipeOut)
def toggle_favorite(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_owned(recipe_id, user.id, db)
    recipe.is_favorite = not recipe.is_favorite
    db.commit()
    db.refresh(recipe)
    return recipe


@router.post("/{recipe_id}/image", response_model=schemas.RecipeOut)
async def upload_recipe_image(
    recipe_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    from config import settings
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise HTTPException(status_code=503, detail="Afbeeldingsopslag niet geconfigureerd")
    recipe = _get_owned(recipe_id, user.id, db)
    try:
        from supabase import create_client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        content = await file.read()
        path = f"{user.id}/{recipe_id}.jpg"
        supabase.storage.from_("recipe-images").upload(
            path=path,
            file=content,
            file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
        public_url = supabase.storage.from_("recipe-images").get_public_url(path)
        recipe.image_url = public_url
        db.commit()
        db.refresh(recipe)
        return recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload mislukt: {str(e)}")


def _get_owned(recipe_id: str, user_id: str, db: Session) -> models.Recipe:
    recipe = db.query(models.Recipe).filter(
        models.Recipe.id == recipe_id,
        models.Recipe.user_id == user_id,
    ).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    return recipe
