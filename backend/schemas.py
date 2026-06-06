from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, field_validator
from models import DayOfWeek, Difficulty, MealType, RecipeCategory, SourceType


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Wachtwoord moet minimaal 8 tekens bevatten")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Ingredient (embedded in Recipe) ──────────────────────────────────────────

class Ingredient(BaseModel):
    name: str
    amount: Optional[float] = None
    unit: Optional[str] = None


class InstructionStep(BaseModel):
    step: int
    text: str


# ── Recipe ───────────────────────────────────────────────────────────────────

class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    servings: Optional[int] = 4
    kcal: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    category: Optional[RecipeCategory] = RecipeCategory.dinner
    cuisine: Optional[str] = None
    difficulty: Optional[Difficulty] = Difficulty.medium
    tags: list[str] = []
    ingredients: list[dict[str, Any]] = []
    instructions: list[dict[str, Any]] = []
    source_url: Optional[str] = None
    source_type: SourceType = SourceType.manual
    is_favorite: bool = False


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    servings: Optional[int] = None
    kcal: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    category: Optional[RecipeCategory] = None
    cuisine: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    tags: Optional[list[str]] = None
    ingredients: Optional[list[dict[str, Any]]] = None
    instructions: Optional[list[dict[str, Any]]] = None
    source_url: Optional[str] = None
    is_favorite: Optional[bool] = None


class RecipeOut(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    servings: Optional[int] = None
    kcal: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    category: Optional[RecipeCategory] = None
    cuisine: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    tags: list[str] = []
    ingredients: list[dict[str, Any]] = []
    instructions: list[dict[str, Any]] = []
    source_url: Optional[str] = None
    source_type: SourceType = SourceType.manual
    is_favorite: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Meal Plan ─────────────────────────────────────────────────────────────────

class MealPlanEntryCreate(BaseModel):
    recipe_id: Optional[str] = None
    day: DayOfWeek
    meal_type: MealType = MealType.dinner
    servings_override: Optional[int] = None
    notes: Optional[str] = None
    eaten: bool = False


class MealPlanEntryOut(BaseModel):
    id: str
    recipe_id: Optional[str] = None
    day: DayOfWeek
    meal_type: MealType
    servings_override: Optional[int] = None
    notes: Optional[str] = None
    eaten: bool = False
    recipe: Optional[RecipeOut] = None

    class Config:
        from_attributes = True


class MealPlanCreate(BaseModel):
    week_start: str  # "2024-01-08"
    notes: Optional[str] = None
    entries: list[MealPlanEntryCreate] = []


class MealPlanUpdate(BaseModel):
    notes: Optional[str] = None
    entries: Optional[list[MealPlanEntryCreate]] = None


class MealPlanOut(BaseModel):
    id: str
    user_id: str
    week_start: str
    notes: Optional[str] = None
    entries: list[MealPlanEntryOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── AI Scraper ────────────────────────────────────────────────────────────────

class ScrapeUrlRequest(BaseModel):
    url: str


class ScrapeResult(BaseModel):
    recipe: RecipeCreate
    confidence: float  # 0-1, hoe zeker het model is
    raw_text: Optional[str] = None
