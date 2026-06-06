from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import Base, engine
from routers import auth, recipes, meal_plans, scraper

# Maak tabellen aan als ze nog niet bestaan (voor SQLite/lokaal gebruik)
# Voor productie: gebruik Alembic migraties
Base.metadata.create_all(bind=engine)

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


@app.get("/health")
def health():
    return {"status": "ok"}
