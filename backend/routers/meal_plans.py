from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/meal-plans", tags=["meal-plans"])


@router.get("/", response_model=list[schemas.MealPlanOut])
def list_plans(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.MealPlan)
        .filter(models.MealPlan.user_id == user.id)
        .options(joinedload(models.MealPlan.entries).joinedload(models.MealPlanEntry.recipe))
        .order_by(models.MealPlan.week_start.desc())
        .all()
    )


@router.get("/{week_start}", response_model=schemas.MealPlanOut)
def get_plan(
    week_start: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    plan = _get_plan(week_start, user.id, db)
    return plan


@router.put("/{week_start}", response_model=schemas.MealPlanOut)
def upsert_plan(
    week_start: str,
    data: schemas.MealPlanCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Maak of vervang het weekmenu voor de opgegeven week."""
    plan = db.query(models.MealPlan).filter(
        models.MealPlan.user_id == user.id,
        models.MealPlan.week_start == week_start,
    ).first()

    if plan:
        # Verwijder bestaande entries en vervang ze
        for entry in plan.entries:
            db.delete(entry)
        plan.notes = data.notes
    else:
        plan = models.MealPlan(user_id=user.id, week_start=week_start, notes=data.notes)
        db.add(plan)
        db.flush()

    for e in data.entries:
        entry = models.MealPlanEntry(meal_plan_id=plan.id, **e.model_dump())
        db.add(entry)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{week_start}", status_code=204)
def delete_plan(
    week_start: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    plan = _get_plan(week_start, user.id, db)
    db.delete(plan)
    db.commit()


def _get_plan(week_start: str, user_id: str, db: Session) -> models.MealPlan:
    plan = (
        db.query(models.MealPlan)
        .filter(models.MealPlan.user_id == user_id, models.MealPlan.week_start == week_start)
        .options(joinedload(models.MealPlan.entries).joinedload(models.MealPlanEntry.recipe))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Weekmenu niet gevonden")
    return plan


# Import missing alias
from models import MealPlanEntry
