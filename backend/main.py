from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from config import settings
from database import Base, engine
from routers import auth, recipes, meal_plans, scraper, catalog

# Maak tabellen aan als ze nog niet bestaan
Base.metadata.create_all(bind=engine)

# Voeg nieuwe kolommen toe die in bestaande tabellen ontbreken (lightweight migratie)
with engine.connect() as conn:
    try:
        conn.execute(text(
            "ALTER TABLE meal_plan_entries ADD COLUMN IF NOT EXISTS eaten BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN NOT NULL DEFAULT FALSE
            )
        """))
        conn.commit()
    except Exception:
        pass
    # household_size op users
    try:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS household_size INTEGER NOT NULL DEFAULT 1"
        ))
        conn.commit()
    except Exception:
        pass
    # portions_eaten op meal_plan_entries
    try:
        conn.execute(text(
            "ALTER TABLE meal_plan_entries ADD COLUMN IF NOT EXISTS portions_eaten FLOAT NULL"
        ))
        conn.commit()
    except Exception:
        pass
    # manual_name op meal_plan_entries (voor "Uit eten" etc.)
    try:
        conn.execute(text(
            "ALTER TABLE meal_plan_entries ADD COLUMN IF NOT EXISTS manual_name VARCHAR(255) NULL"
        ))
        conn.commit()
    except Exception:
        pass
    # is_admin op users
    try:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.commit()
    except Exception:
        pass
    # Maak Dieter admin
    try:
        conn.execute(text(
            "UPDATE users SET is_admin = TRUE WHERE email = 'dietvandevelde@gmail.com'"
        ))
        conn.commit()
    except Exception:
        pass
    # catalog_recipe_id op recipes (FK naar catalog_recipes, geen constraint om migratie eenvoudig te houden)
    try:
        conn.execute(text(
            "ALTER TABLE recipes ADD COLUMN IF NOT EXISTS catalog_recipe_id UUID NULL"
        ))
        conn.commit()
    except Exception:
        pass

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
