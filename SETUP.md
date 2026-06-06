# Mise en Place — Setup

## Overzicht

| Component | Technologie |
|-----------|-------------|
| Frontend | HTML/CSS/JS (geen framework) |
| Backend | Python FastAPI |
| Database | PostgreSQL (aanbevolen: Supabase) |
| AI scraper | Anthropic Claude (claude-opus-4-8) |
| Auth | JWT (7 dagen geldig) |

---

## 1. Database instellen (Supabase — gratis tier)

1. Ga naar [supabase.com](https://supabase.com) en maak een project aan.
2. Ga naar **Project Settings → Database → Connection string → URI**.
3. Kopieer de connection string (begint met `postgresql://`).

---

## 2. Backend configureren

```powershell
cd backend
Copy-Item .env.example .env
```

Bewerk `.env`:

```env
DATABASE_URL=postgresql://postgres:jouw-wachtwoord@db.xxxxx.supabase.co:5432/postgres
SECRET_KEY=genereer-een-lange-willekeurige-string-hier
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

**SECRET_KEY genereren:**
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 3. Backend starten

```powershell
cd backend
.\start.ps1
```

Of handmatig:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

De API draait op http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

## 4. Frontend openen

Open `Weekmenu Planner.html` in een browser.  
Als de browser CORS blokkeert, gebruik een lokale server:

```powershell
# In de projectmap:
python -m http.server 5500
# Open: http://localhost:5500/Weekmenu%20Planner.html
```

---

## API-endpoints

### Auth
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| POST | `/auth/register` | Nieuw account aanmaken |
| POST | `/auth/login` | Inloggen, ontvangt JWT token |
| GET | `/auth/me` | Huidige gebruiker ophalen |

### Recepten
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| GET | `/recipes/` | Alle recepten van de gebruiker |
| POST | `/recipes/` | Nieuw recept aanmaken |
| GET | `/recipes/{id}` | Recept ophalen |
| PUT | `/recipes/{id}` | Recept bijwerken |
| DELETE | `/recipes/{id}` | Recept verwijderen |
| POST | `/recipes/{id}/favorite` | Favoriet aan/uitzetten |

### Weekmenu
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| GET | `/meal-plans/` | Alle weekmenu's |
| GET | `/meal-plans/{week_start}` | Weekmenu voor een week (bijv. `2024-01-08`) |
| PUT | `/meal-plans/{week_start}` | Weekmenu aanmaken of vervangen |
| DELETE | `/meal-plans/{week_start}` | Weekmenu verwijderen |

### AI Scraper
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| POST | `/scraper/url` | Recept importeren via URL |
| POST | `/scraper/screenshot` | Recept importeren via screenshot (multipart/form-data) |

---

## Database-structuur

```
users
├── id (UUID, PK)
├── email (uniek)
├── name
├── password_hash
├── avatar_url
├── is_active
└── created_at / updated_at

recipes
├── id (UUID, PK)
├── user_id (FK → users)
├── name, description, image_url
├── prep_time, cook_time, total_time (minuten)
├── servings
├── kcal, protein, carbs, fat, fiber (per portie)
├── category, cuisine, difficulty
├── tags (JSON array)
├── ingredients (JSON: [{name, amount, unit}])
├── instructions (JSON: [{step, text}])
├── source_url, source_type (manual/url/screenshot)
├── is_favorite
└── created_at / updated_at

meal_plans
├── id (UUID, PK)
├── user_id (FK → users)
├── week_start (datum van de maandag, bijv. "2024-01-08")
├── notes
└── created_at / updated_at

meal_plan_entries
├── id (UUID, PK)
├── meal_plan_id (FK → meal_plans)
├── recipe_id (FK → recipes, nullable)
├── day (monday t/m sunday)
├── meal_type (breakfast/lunch/dinner/snack)
├── servings_override
└── notes
```
