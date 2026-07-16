from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/catalog", tags=["catalog"])


def _require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Geen beheerdersrechten")
    return user


@router.get("/", response_model=list[schemas.CatalogRecipeOut])
def list_catalog(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return db.query(models.CatalogRecipe).order_by(models.CatalogRecipe.name).all()


@router.post("/", response_model=schemas.CatalogRecipeOut, status_code=201)
def create_catalog_recipe(
    data: schemas.CatalogRecipeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(_require_admin),
):
    recipe = models.CatalogRecipe(**data.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.put("/{recipe_id}", response_model=schemas.CatalogRecipeOut)
def update_catalog_recipe(
    recipe_id: str,
    data: schemas.CatalogRecipeUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(_require_admin),
):
    recipe = db.query(models.CatalogRecipe).filter(models.CatalogRecipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(recipe, field, value)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_catalog_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(_require_admin),
):
    recipe = db.query(models.CatalogRecipe).filter(models.CatalogRecipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    db.delete(recipe)
    db.commit()


@router.post("/{recipe_id}/adopt", response_model=schemas.RecipeOut, status_code=201)
def adopt_catalog_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    catalog = db.query(models.CatalogRecipe).filter(models.CatalogRecipe.id == recipe_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Recept niet gevonden in catalogus")

    existing = db.query(models.Recipe).filter(
        models.Recipe.user_id == user.id,
        models.Recipe.catalog_recipe_id == recipe_id,
    ).first()
    if existing:
        return existing

    recipe = models.Recipe(
        user_id=user.id,
        catalog_recipe_id=recipe_id,
        name=catalog.name,
        description=catalog.description,
        image_url=catalog.image_url,
        prep_time=catalog.prep_time,
        cook_time=catalog.cook_time,
        total_time=catalog.total_time,
        servings=catalog.servings,
        kcal=catalog.kcal,
        protein=catalog.protein,
        carbs=catalog.carbs,
        fat=catalog.fat,
        fiber=catalog.fiber,
        category=catalog.category,
        cuisine=catalog.cuisine,
        difficulty=catalog.difficulty,
        tags=catalog.tags,
        ingredients=catalog.ingredients,
        instructions=catalog.instructions,
        source_url=catalog.source_url,
        source_type=models.SourceType.manual,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.post("/from-recipe/{recipe_id}", response_model=schemas.CatalogRecipeOut, status_code=201)
def promote_to_catalog(
    recipe_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(_require_admin),
):
    """Kopieer een persoonlijk recept van de admin naar de gedeelde catalogus."""
    personal = db.query(models.Recipe).filter(
        models.Recipe.id == recipe_id,
        models.Recipe.user_id == admin.id,
    ).first()
    if not personal:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")

    catalog = models.CatalogRecipe(
        name=personal.name,
        description=personal.description,
        image_url=personal.image_url,
        prep_time=personal.prep_time,
        cook_time=personal.cook_time,
        total_time=personal.total_time,
        servings=personal.servings or 4,
        kcal=personal.kcal,
        protein=personal.protein,
        carbs=personal.carbs,
        fat=personal.fat,
        fiber=personal.fiber,
        category=personal.category,
        cuisine=personal.cuisine,
        difficulty=personal.difficulty,
        tags=personal.tags or [],
        ingredients=personal.ingredients or [],
        instructions=personal.instructions or [],
        source_url=personal.source_url,
        is_healthy=False,
    )
    db.add(catalog)
    db.commit()
    db.refresh(catalog)

    personal.catalog_recipe_id = catalog.id
    db.commit()

    return catalog
