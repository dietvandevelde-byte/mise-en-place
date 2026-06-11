"""AI-recepten-scraper — haalt receptdata op uit een URL of screenshot."""
import base64
import json
import re
from io import BytesIO

import anthropic
import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel


def _find_recipe_in_blob(blob, _depth=0) -> str:
    """Walk a nested dict/list to find the subtree most likely to contain a recipe."""
    if _depth > 10:
        return json.dumps(blob, ensure_ascii=False)
    if isinstance(blob, dict):
        # Look for recipe-like keys
        recipe_keys = {"ingredients", "instructions", "recipeIngredient", "recipeInstructions",
                       "preparationSteps", "ingrediënten", "bereidingswijze"}
        if recipe_keys & set(str(k).lower() for k in blob.keys()):
            return json.dumps(blob, ensure_ascii=False)
        # Recurse into likely containers
        for key in ("pageProps", "recipe", "recept", "data", "props", "initialData"):
            if key in blob:
                result = _find_recipe_in_blob(blob[key], _depth + 1)
                if len(result) > 100:
                    return result
    if isinstance(blob, list):
        for item in blob:
            result = _find_recipe_in_blob(item, _depth + 1)
            if len(result) > 100:
                return result
    return json.dumps(blob, ensure_ascii=False)


def _extract_content(html: str) -> str:
    """Extract recipe-relevant text from HTML.
    1. Try JSON-LD Recipe schema.
    2. Try Next.js __NEXT_DATA__ embedded JSON.
    3. Fall back to stripped HTML text.
    """
    # 1. Look for JSON-LD with @type Recipe
    for match in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE):
        try:
            data = json.loads(match.group(1))
            items = data if isinstance(data, list) else data.get("@graph", [data])
            for item in items:
                if isinstance(item, dict) and "Recipe" in str(item.get("@type", "")):
                    return f"[JSON-LD Recipe schema gevonden]\n{json.dumps(item, ensure_ascii=False)[:30_000]}"
        except Exception:
            continue

    # 2. Try Next.js __NEXT_DATA__ (and similar framework blobs)
    for pattern in [
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>',
        r'<script[^>]+id=["\']__NUXT_DATA__["\'][^>]*>(.*?)</script>',
        r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*(?:</script>|window\.)',
    ]:
        m = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if m:
            try:
                blob = json.loads(m.group(1))
                # Try to find the recipe-relevant subtree to keep token count low
                text = _find_recipe_in_blob(blob)
                return f"[Next.js/framework data gevonden]\n{text[:30_000]}"
            except Exception:
                continue

    # 3. Strip HTML tags and collapse whitespace
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()[:30_000]

from auth import get_current_user
from config import settings
import models
import schemas

router = APIRouter(prefix="/scraper", tags=["scraper"])

SYSTEM_PROMPT = """Je bent een recepten-extractor. Je ontvangt de inhoud van een webpagina of een screenshot van een recept.
Extraheer alle beschikbare receptinformatie en geef dit terug als geldig JSON-object met EXACT de volgende structuur:

{
  "name": "Naam van het recept",
  "description": "Korte omschrijving",
  "prep_time": 15,
  "cook_time": 30,
  "total_time": 45,
  "servings": 4,
  "kcal": 450,
  "protein": 25.0,
  "carbs": 40.0,
  "fat": 15.0,
  "fiber": 5.0,
  "category": "dinner",
  "cuisine": "Italiaans",
  "difficulty": "easy",
  "tags": ["vegetarisch", "snel"],
  "ingredients": [
    {"name": "pasta", "amount": 400, "unit": "g", "cat": "Voorraad"},
    {"name": "tomatensaus", "amount": 200, "unit": "ml", "cat": "Voorraad"}
  ],
  "instructions": [
    {"step": 1, "text": "Kook de pasta al dente."},
    {"step": 2, "text": "Verwarm de saus."}
  ],
  "confidence": 0.9
}

Regels:
- Gebruik null voor onbekende numerieke velden (niet 0)
- category (recept) moet één van zijn: breakfast, lunch, dinner, snack, dessert, soup, salad, other
- difficulty moet één van zijn: easy, medium, hard
- cat (per ingrediënt) moet één van zijn: Groenten, Fruit, Vlees, Kaas, Brood, Voorraad, Zuivel, Dranken, Diepvries, Huishouden, Overige
  Gebruik de meest passende supermarktafdeling: melk/yoghurt/boter/room/eieren/amandelmelk → Zuivel; fruit/bessen → Fruit; groenten/aardappel → Groenten; vlees/vis/ham/spek → Vlees; kaas/mozzarella/feta → Kaas; brood/wrap/pita → Brood; pasta/rijst/blik/sauzen/olie/kruiden → Voorraad
- confidence is een getal tussen 0 en 1 dat aangeeft hoe volledig de extractie was
- Retourneer ALLEEN het JSON-object, geen uitleg of markdown
"""


def _call_claude(messages: list) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    raw = response.content[0].text.strip()
    # Strip markdown code blocks if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Claude retourneerde geen geldig JSON: {e}")


def _build_recipe(data: dict, source_url: str | None, source_type: models.SourceType) -> schemas.RecipeCreate:
    confidence = data.pop("confidence", 1.0)
    data["source_url"] = source_url
    data["source_type"] = source_type

    # Zet None-waarden om voor niet-verplichte velden
    for field in ("prep_time", "cook_time", "total_time", "servings", "kcal",
                  "protein", "carbs", "fat", "fiber"):
        if data.get(field) == 0:
            data[field] = None

    return schemas.RecipeCreate(**{k: v for k, v in data.items() if k in schemas.RecipeCreate.model_fields})


@router.post("/url", response_model=schemas.ScrapeResult)
async def scrape_from_url(
    body: schemas.ScrapeUrlRequest,
    user: models.User = Depends(get_current_user),
):
    """Haal een recept op via een URL. Claude leest de paginatekst."""
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(body.url, headers={"User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)"})
            resp.raise_for_status()
            content = _extract_content(resp.text)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Kon URL niet ophalen: {e}")

    messages = [{"role": "user", "content": f"URL: {body.url}\n\nInhoud:\n{content}"}]
    data = _call_claude(messages)

    # Fallback: JS-rendered site — no ingredients extracted. Ask Claude from its own knowledge.
    if not data.get("ingredients"):
        recipe_name = data.get("name", "")
        fallback_msg = (
            f"De webpagina op {body.url} is JavaScript-rendered en kon niet gescraped worden. "
            f"Het recept heet: \"{recipe_name}\". "
            f"Gebruik je eigen trainingskennis om dit recept volledig te reconstrueren "
            f"met ingrediënten, hoeveelheden en bereidingswijze."
        )
        data = _call_claude([{"role": "user", "content": fallback_msg}])
        # Keep the original source URL
        data["source_url"] = body.url

    recipe = _build_recipe(data, source_url=body.url, source_type=models.SourceType.url)
    return schemas.ScrapeResult(recipe=recipe, confidence=data.get("confidence", 0.9))


@router.post("/screenshot", response_model=schemas.ScrapeResult)
async def scrape_from_screenshot(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    """Extraheer een recept uit een screenshot (JPG/PNG/WEBP, max 5 MB)."""
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Afbeelding mag maximaal 5 MB zijn")

    content = await file.read()
    media_type = file.content_type or "image/jpeg"

    b64 = base64.standard_b64encode(content).decode()

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64},
                },
                {"type": "text", "text": "Extraheer het recept uit deze screenshot."},
            ],
        }
    ]
    data = _call_claude(messages)
    recipe = _build_recipe(data, source_url=None, source_type=models.SourceType.screenshot)
    confidence = data.get("confidence", 0.85)
    return schemas.ScrapeResult(recipe=recipe, confidence=confidence)


class ScrapeTextRequest(BaseModel):
    text: str


@router.post("/text", response_model=schemas.ScrapeResult)
async def scrape_from_text(
    body: ScrapeTextRequest,
    user: models.User = Depends(get_current_user),
):
    """Extraheer een recept uit geplakte recepttekst."""
    messages = [{"role": "user", "content": f"Recepttekst:\n{body.text[:8000]}"}]
    data = _call_claude(messages)
    recipe = _build_recipe(data, source_url=None, source_type=models.SourceType.manual)
    return schemas.ScrapeResult(recipe=recipe, confidence=data.get("confidence", 0.85))


class NutritionRequest(BaseModel):
    title: str
    ingredients: list[dict]
    portions: int = 1


@router.post("/nutrition")
async def calculate_nutrition(
    body: NutritionRequest,
    user: models.User = Depends(get_current_user),
):
    """Bereken voedingswaarden op basis van ingrediënten via Claude + NEVO-kennisbank."""
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    ing_text = "\n".join(
        f"- {i.get('name','')} {i.get('qty','')} {i.get('unit','')}" for i in body.ingredients
    )

    prompt = f"""Je bent een voedingsdeskundige met kennis van de NEVO-tabel (Nederlandse voedingsmiddelentabel).

Bereken de voedingswaarden PER PORTIE voor dit recept ({body.portions} porties totaal):

Recept: {body.title}
Ingrediënten:
{ing_text}

Geef ALLEEN een geldig JSON-object terug met deze velden (getallen, geen eenheden):
{{"kcal": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}}

Regels:
- kcal = geheel getal (kilocalorieën per portie)
- protein, carbs, fat = getal met 1 decimaal (gram per portie)
- Baseer je op realistische portiegroottes en de NEVO-tabel
- Geef ALLEEN het JSON-object, geen uitleg"""

    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Kon voedingswaarden niet berekenen")
