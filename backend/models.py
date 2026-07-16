import uuid
from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from database import Base
import enum


class DayOfWeek(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


class RecipeCategory(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"
    dessert = "dessert"
    soup = "soup"
    salad = "salad"
    other = "other"


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class SourceType(str, enum.Enum):
    manual = "manual"
    url = "url"
    screenshot = "screenshot"


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    household_size = Column(Integer, default=1, nullable=False)

    @hybrid_property
    def is_admin(self) -> bool:
        from config import settings
        return self.email.lower() in settings.admin_email_list
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="user", cascade="all, delete-orphan")


class CatalogRecipe(Base):
    """Gedeelde receptencatalogus, beheerd door admins."""
    __tablename__ = "catalog_recipes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(512), nullable=True)
    prep_time = Column(Integer, nullable=True)
    cook_time = Column(Integer, nullable=True)
    total_time = Column(Integer, nullable=True)
    servings = Column(Integer, nullable=False, default=4)
    kcal = Column(Integer, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    category = Column(SAEnum(RecipeCategory), nullable=True, default=RecipeCategory.dinner)
    cuisine = Column(String(100), nullable=True)
    difficulty = Column(SAEnum(Difficulty), nullable=True, default=Difficulty.medium)
    tags = Column(JSON, nullable=False, default=list)
    ingredients = Column(JSON, nullable=False, default=list)
    instructions = Column(JSON, nullable=False, default=list)
    source_url = Column(String(512), nullable=True)
    is_healthy = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Basisinfo
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(512), nullable=True)

    # Tijden (minuten)
    prep_time = Column(Integer, nullable=True)   # voorbereidingstijd
    cook_time = Column(Integer, nullable=True)   # bereidingstijd
    total_time = Column(Integer, nullable=True)  # totale tijd

    # Porties & voeding (per portie)
    servings = Column(Integer, nullable=True, default=4)
    kcal = Column(Integer, nullable=True)        # calorieën
    protein = Column(Float, nullable=True)       # eiwit (g)
    carbs = Column(Float, nullable=True)         # koolhydraten (g)
    fat = Column(Float, nullable=True)           # vet (g)
    fiber = Column(Float, nullable=True)         # vezels (g)

    # Classificatie
    category = Column(SAEnum(RecipeCategory), nullable=True, default=RecipeCategory.dinner)
    cuisine = Column(String(100), nullable=True)  # bijv. Italiaans, Aziatisch
    difficulty = Column(SAEnum(Difficulty), nullable=True, default=Difficulty.medium)
    tags = Column(JSON, nullable=True, default=list)  # ["vegetarisch", "glutenvrij", ...]

    # Ingrediënten & instructies (als gestructureerde JSON)
    # ingrediënten: [{"name": "bloem", "amount": 200, "unit": "g"}]
    ingredients = Column(JSON, nullable=True, default=list)
    # instructies: [{"step": 1, "text": "..."}]
    instructions = Column(JSON, nullable=True, default=list)

    # Bron
    source_url = Column(String(512), nullable=True)
    source_type = Column(SAEnum(SourceType), nullable=False, default=SourceType.manual)

    # Koppeling met de gedeelde catalogus (null = persoonlijk recept)
    catalog_recipe_id = Column(UUID(as_uuid=False), nullable=True)

    # Gebruikersmarkering
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="recipes")
    meal_entries = relationship("MealPlanEntry", back_populates="recipe")


class PasswordResetToken(Base):
    """Tijdelijk token voor wachtwoord-reset via e-mail."""
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)

    user = relationship("User")


class MealPlan(Base):
    """Weekmenu voor één gebruiker, startend op maandag."""
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_start = Column(String(10), nullable=False)  # ISO date "2024-01-08" (altijd maandag)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="meal_plans")
    entries = relationship("MealPlanEntry", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanEntry(Base):
    """Één gerecht op één dag in een weekmenu."""
    __tablename__ = "meal_plan_entries"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meal_plan_id = Column(UUID(as_uuid=False), ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(UUID(as_uuid=False), ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True)
    day = Column(SAEnum(DayOfWeek), nullable=False)
    meal_type = Column(SAEnum(MealType), nullable=False, default=MealType.dinner)
    servings_override = Column(Integer, nullable=True)  # afwijkend aantal porties voor dit plan
    notes = Column(Text, nullable=True)
    manual_name = Column(String(255), nullable=True)
    eaten = Column(Boolean, default=False, nullable=False)
    portions_eaten = Column(Float, nullable=True)  # hoeveel porties de gebruiker zelf heeft gegeten (null = niet gelogd)

    meal_plan = relationship("MealPlan", back_populates="entries")
    recipe = relationship("Recipe", back_populates="meal_entries")
