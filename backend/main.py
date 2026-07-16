from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import Base, engine
from routers import auth, recipes, meal_plans, scraper, catalog

# Maak nieuwe tabellen aan als ze nog niet bestaan (bestaande tabellen worden niet gewijzigd)
Base.metadata.create_all(bind=engine)

# Ensure recipe-images bucket is public (idempotent on every deploy)
try:
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        from supabase import create_client as _sb_create
        _sb = _sb_create(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        _sb.storage.update_bucket("recipe-images", options={"public": True})
except Exception:
    pass

app = FastAPI(
    title="Mise en Place API",
    description="Backend voor de weekmenu-planner Mise en Place",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(meal_plans.router)
app.include_router(scraper.router)
app.include_router(catalog.router)


@app.get("/health")
def health():
    return {"status": "ok"}
