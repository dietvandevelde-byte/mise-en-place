#!/usr/bin/env python3
"""
Seed de catalogus — batch 2 (27 recepten).

Gebruik:
  python seed_catalog_2.py <api_url> <email> <password>
"""
import sys
import json
import urllib.request
import urllib.error


def login(api_url, email, password):
    data = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(
        f"{api_url}/auth/login", data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["access_token"]


def batch_import(api_url, token, recipes):
    data = json.dumps(recipes).encode()
    req = urllib.request.Request(
        f"{api_url}/catalog/batch", data=data,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


RECIPES = [

    # ══════════════════════════════════
    # BELGISCHE KLASSIEKERS (1-6)
    # ══════════════════════════════════

    {
        "name": "Gentse hutsepot",
        "description": "Rijke Gentse stoofpot met rundvlees, varkenswang, rapen, wortels en aardappelen. Een volledige maaltijd in één pot.",
        "prep_time": 30, "cook_time": 150, "total_time": 180,
        "servings": 4, "kcal": 520, "protein": 44.0, "carbs": 32.0, "fat": 20.0, "fiber": 6.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "hard",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "runderstoofvlees (rib of schouder)", "amount": 500, "unit": "g", "cat": "Vlees"},
            {"name": "varkenswang of -buik", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "wortels", "amount": 3, "unit": "stuk", "cat": "Groenten"},
            {"name": "rapen (raapjes)", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "aardappelen", "amount": 600, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "prei", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "runderbouillon", "amount": 1200, "unit": "ml", "cat": "Voorraad"},
            {"name": "verse tijm", "amount": 3, "unit": "takjes", "cat": "Voorraad"},
            {"name": "laurierblaadjes", "amount": 2, "unit": "stuk", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Snijd het rundvlees en de varkenswang in blokken van 4 cm. Kruid royaal met zout en peper."},
            {"step": 2, "text": "Braad het vlees in porties rondom goudbruin aan in een grote stoofpot. Haal apart."},
            {"step": 3, "text": "Stoof de gesneden ui en bleekselderij 3 minuten in het braadvet."},
            {"step": 4, "text": "Leg het vlees terug. Giet de bouillon erbij en breng aan de kook. Voeg tijm en laurier toe."},
            {"step": 5, "text": "Laat 1 uur sudderen op laag vuur. Voeg dan wortels, rapen en prei toe."},
            {"step": 6, "text": "Kook nog 30 minuten. Voeg de aardappelen toe en laat verder gaar worden (±20 minuten)."},
            {"step": 7, "text": "Proef en breng op smaak. Serveer met mosterd en grof brood."},
        ],
    },

    {
        "name": "Asperges op zijn Belgisch",
        "description": "Witte asperges met gekookte hesp, gesmolten boter, gehakt hardgekookt ei en verse peterselie.",
        "prep_time": 15, "cook_time": 20, "total_time": 35,
        "servings": 4, "kcal": 380, "protein": 22.0, "carbs": 10.0, "fat": 28.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "witte asperges", "amount": 1200, "unit": "g", "cat": "Groenten"},
            {"name": "gekookte hesp (ham)", "amount": 200, "unit": "g", "cat": "Vlees"},
            {"name": "eieren", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "boter", "amount": 100, "unit": "g", "cat": "Zuivel"},
            {"name": "verse peterselie (fijngehakt)", "amount": 3, "unit": "el", "cat": "Groenten"},
            {"name": "nootmuskaat", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Schil de asperges van kop naar voet. Breek de houtige uiteinden af."},
            {"step": 2, "text": "Kook de eieren hard (10 min). Laat afkoelen, schil en hak fijn."},
            {"step": 3, "text": "Kook de asperges in gezouten water met een snufje suiker en een stukje boter, 12-15 minuten naargelang dikte."},
            {"step": 4, "text": "Smelt intussen de rest van de boter zachtjes in een steelpan (niet bruin laten worden)."},
            {"step": 5, "text": "Leg de asperges op een schaal. Schik de hesp er naast. Giet de gesmolten boter erover."},
            {"step": 6, "text": "Bestrooi met gehakt ei en peterselie. Kruid met nootmuskaat en peper."},
        ],
    },

    {
        "name": "Biefstuk met pepersaus",
        "description": "Gebakken rundbiefstuk met een romige saus van groene peperkorrels, cognac en slagroom.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 520, "protein": 42.0, "carbs": 4.0, "fat": 34.0, "fiber": 0.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "rundbiefstuk (entrecôte of ossenhaas)", "amount": 4, "unit": "stuk (à 180 g)", "cat": "Vlees"},
            {"name": "groene peperkorrels (in pekel)", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "cognac of brandy", "amount": 50, "unit": "ml", "cat": "Dranken"},
            {"name": "slagroom", "amount": 200, "unit": "ml", "cat": "Zuivel"},
            {"name": "kippenbouillon", "amount": 100, "unit": "ml", "cat": "Voorraad"},
            {"name": "sjalot", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
        ],
        "instructions": [
            {"step": 1, "text": "Haal de biefstukken 30 min voor het bakken uit de koelkast. Dep droog en kruid met zout en peper."},
            {"step": 2, "text": "Verhit boter in een zware pan op hoog vuur. Bak de biefstukken 2-3 min per kant (medium-rare). Haal apart en houd warm."},
            {"step": 3, "text": "Fruit de gesneden sjalot in de pan. Voeg de peperkorrels toe en plet ze licht."},
            {"step": 4, "text": "Blus met cognac en flambeer voorzichtig, of laat 30 seconden inkoken."},
            {"step": 5, "text": "Voeg bouillon en slagroom toe. Laat inkoken tot een lichte saus (5 min). Breng op smaak."},
            {"step": 6, "text": "Leg de biefstukken terug in de saus om even op te warmen. Serveer met frietjes of gebakken aardappelen."},
        ],
    },

    {
        "name": "Kippensoep met gehaktballetjes",
        "description": "Hartige maaltijdsoep met kleine gehaktballetjes, vermicelli, wortels en verse peterselie.",
        "prep_time": 20, "cook_time": 40, "total_time": 60,
        "servings": 4, "kcal": 320, "protein": 24.0, "carbs": 22.0, "fat": 12.0, "fiber": 2.0,
        "category": "soup", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": True,
        "ingredients": [
            {"name": "kippenbouillon", "amount": 1500, "unit": "ml", "cat": "Voorraad"},
            {"name": "gemengd gehakt (rund-varken)", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "vermicelli", "amount": 80, "unit": "g", "cat": "Brood"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "prei", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 1, "unit": "stengel", "cat": "Groenten"},
            {"name": "ei", "amount": 1, "unit": "stuk", "cat": "Zuivel"},
            {"name": "paneermeel", "amount": 3, "unit": "el", "cat": "Brood"},
            {"name": "verse peterselie", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "nootmuskaat", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Maak de balletjes: meng gehakt met ei, paneermeel, nootmuskaat, zout en peper. Draai balletjes van 2 cm."},
            {"step": 2, "text": "Breng de kippenbouillon aan de kook. Voeg gesneden wortels, prei en bleekselderij toe."},
            {"step": 3, "text": "Laat 15 minuten sudderen op middelhoog vuur."},
            {"step": 4, "text": "Voeg de gehaktballetjes voorzichtig toe. Laat 10 minuten zachtjes koken."},
            {"step": 5, "text": "Voeg de vermicelli toe en kook nog 5 minuten."},
            {"step": 6, "text": "Breng op smaak met zout en peper. Garneer met verse peterselie."},
        ],
    },

    {
        "name": "Gehaktbrood met tomatensaus",
        "description": "Huisgemaakt gehaktbrood van rund en varken, gebakken in een rijke tomatensaus. Klassiek familiegerecht.",
        "prep_time": 20, "cook_time": 60, "total_time": 80,
        "servings": 4, "kcal": 480, "protein": 34.0, "carbs": 18.0, "fat": 28.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "gemengd gehakt (rund-varken)", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "ui", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "ei", "amount": 1, "unit": "stuk", "cat": "Zuivel"},
            {"name": "broodkruimels of oud brood", "amount": 60, "unit": "g", "cat": "Brood"},
            {"name": "volle melk", "amount": 50, "unit": "ml", "cat": "Zuivel"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "tomatenpuree", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm de oven voor op 180 °C. Week het broodkruim in de melk."},
            {"step": 2, "text": "Stoof de helft van de gesnipperde ui en knoflook glazig in olijfolie. Laat afkoelen."},
            {"step": 3, "text": "Meng gehakt, geweekt broodkruim, ei, gebakken ui, peterselie, zout en peper tot een egaal mengsel."},
            {"step": 4, "text": "Vorm een brood en leg in een ovenschaal. Bak 20 minuten aan op 180 °C."},
            {"step": 5, "text": "Maak intussen de saus: stoof de rest van de ui, voeg tomatenpuree, tomaten en 100 ml water toe. Laat 10 min sudderen."},
            {"step": 6, "text": "Giet de saus over het gehaktbrood en bak nog 35 minuten. Bedruip af en toe met de saus."},
            {"step": 7, "text": "Laat 5 minuten rusten voor het snijden. Serveer met gebakken aardappelen of aardappelpuree."},
        ],
    },

    {
        "name": "Varkenswangen in Trappistenbier",
        "description": "Ultiem malse varkenswangen langzaam gestoofd in Belgisch Trappistenbier met wortelgroenten.",
        "prep_time": 20, "cook_time": 180, "total_time": 200,
        "servings": 4, "kcal": 460, "protein": 40.0, "carbs": 14.0, "fat": 24.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "varkenswangen", "amount": 800, "unit": "g", "cat": "Vlees"},
            {"name": "Trappistenbier (Westmalle of Chimay)", "amount": 330, "unit": "ml", "cat": "Dranken"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "runderbouillon", "amount": 300, "unit": "ml", "cat": "Voorraad"},
            {"name": "tomatenpuree", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "verse tijm", "amount": 4, "unit": "takjes", "cat": "Voorraad"},
            {"name": "laurierblaadjes", "amount": 2, "unit": "stuk", "cat": "Voorraad"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
        ],
        "instructions": [
            {"step": 1, "text": "Kruid de varkenswangen met zout en peper. Braad rondom goudbruin aan in boter. Haal apart."},
            {"step": 2, "text": "Bak gesneden uien, wortels en knoflook in dezelfde pan 5 minuten."},
            {"step": 3, "text": "Voeg tomatenpuree toe en bak 1 minuut mee. Blus met het bier."},
            {"step": 4, "text": "Leg de wangen terug, voeg bouillon, tijm en laurier toe. Breng aan de kook."},
            {"step": 5, "text": "Zet op laag vuur en stoof 2,5 à 3 uur met deksel tot het vlees boterzacht is en van de lepel valt."},
            {"step": 6, "text": "Haal de wangen eruit. Zeef de saus en laat inkoken tot gewenste dikte. Breng op smaak."},
            {"step": 7, "text": "Serveer met aardappelpuree en gestoofde groenten."},
        ],
    },

    # ══════════════════════════════════
    # WERELDKEUKEN (7-19)
    # ══════════════════════════════════

    {
        "name": "Lasagne bolognese",
        "description": "Klassieke Italiaanse lasagne met rijke vleessaus, romige béchamel en gegratineerde Parmezaan.",
        "prep_time": 30, "cook_time": 60, "total_time": 90,
        "servings": 4, "kcal": 580, "protein": 32.0, "carbs": 52.0, "fat": 24.0, "fiber": 4.0,
        "category": "dinner", "cuisine": "Italiaans", "difficulty": "hard",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "lasagnebladen (droog)", "amount": 250, "unit": "g", "cat": "Brood"},
            {"name": "rundergehakt", "amount": 400, "unit": "g", "cat": "Vlees"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "wortel", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 1, "unit": "stengel", "cat": "Groenten"},
            {"name": "tomatenpuree", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rode wijn", "amount": 100, "unit": "ml", "cat": "Dranken"},
            {"name": "volle melk", "amount": 600, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 50, "unit": "g", "cat": "Zuivel"},
            {"name": "bloem", "amount": 50, "unit": "g", "cat": "Voorraad"},
            {"name": "Parmezaan (geraspt)", "amount": 80, "unit": "g", "cat": "Kaas"},
            {"name": "nootmuskaat", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Maak de bolognese: stoof ui, wortel, selderij en knoflook 5 min. Voeg gehakt toe, bak bruin."},
            {"step": 2, "text": "Voeg tomatenpuree, wijn, tomaten en 200 ml water toe. Laat 30 min sudderen op laag vuur. Breng op smaak."},
            {"step": 3, "text": "Maak de béchamel: smelt boter, voeg bloem toe en bak 1 min. Klop er de melk bij en roer tot een gladde saus. Kruid met nootmuskaat."},
            {"step": 4, "text": "Verwarm oven op 180 °C. Leg een laagje béchamel op de bodem van een ovenschaal."},
            {"step": 5, "text": "Leg lasagnebladen erop, dan vleessaus, dan béchamel. Herhaal 3-4 keer. Eindig met béchamel."},
            {"step": 6, "text": "Bestrooi met Parmezaan en bak 35-40 minuten tot goudbruin. Laat 10 min rusten voor het snijden."},
        ],
    },

    {
        "name": "Paella met kip en chorizo",
        "description": "Spaanse rijstschotel met kippendijen, pikante chorizo, rode paprika en saffraan.",
        "prep_time": 20, "cook_time": 40, "total_time": 60,
        "servings": 4, "kcal": 560, "protein": 38.0, "carbs": 54.0, "fat": 20.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Spaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "paellarijst (Bomba of Calasparra)", "amount": 320, "unit": "g", "cat": "Voorraad"},
            {"name": "kippendijen (zonder bot)", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "chorizo (in plakjes)", "amount": 150, "unit": "g", "cat": "Vlees"},
            {"name": "rode paprika's", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "kippenbouillon (warm)", "amount": 900, "unit": "ml", "cat": "Voorraad"},
            {"name": "saffraan", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
            {"name": "gerookt paprikapoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen", "amount": 1, "unit": "stuk", "cat": "Fruit"},
        ],
        "instructions": [
            {"step": 1, "text": "Leg saffraan in 2 el warm water. Kruid de kip met zout, peper en paprikapoeder."},
            {"step": 2, "text": "Bak kip in olijfolie in de paellapan goudbruin aan. Haal apart. Bak chorizo 2 min, haal apart."},
            {"step": 3, "text": "Stoof ui, knoflook en paprika 5 min. Voeg tomaten toe en bak tot droog (5 min)."},
            {"step": 4, "text": "Voeg de rijst toe en bak 1 min mee. Giet de bouillon en het saffraanwater erbij. Roer goed."},
            {"step": 5, "text": "Leg kip en chorizo bovenop. Breng aan de kook, zet op middelhoog vuur. Niet meer roeren."},
            {"step": 6, "text": "Kook 20-25 min tot de rijst de bouillon geabsorbeerd heeft. Laat 5 min rusten. Serveer met citroen."},
        ],
    },

    {
        "name": "Butter chicken",
        "description": "Romige Indiase kip-tomatencurry met garam masala, gember en een vleugje room. Mild en vol smaak.",
        "prep_time": 20, "cook_time": 35, "total_time": 55,
        "servings": 4, "kcal": 420, "protein": 40.0, "carbs": 14.0, "fat": 22.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Indiaas", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kippenborst (in blokjes)", "amount": 700, "unit": "g", "cat": "Vlees"},
            {"name": "volle yoghurt", "amount": 150, "unit": "ml", "cat": "Zuivel"},
            {"name": "garam masala", "amount": 3, "unit": "tl", "cat": "Voorraad"},
            {"name": "verse gember", "amount": 30, "unit": "g", "cat": "Groenten"},
            {"name": "knoflook", "amount": 5, "unit": "teentjes", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "slagroom of kokosroom", "amount": 150, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 40, "unit": "g", "cat": "Zuivel"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "kurkuma", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "suiker", "amount": 1, "unit": "tl", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Marineer kip in yoghurt, 1 tl garam masala, helft van de knoflook en gember. Min. 1 uur (of nacht)."},
            {"step": 2, "text": "Gril of bak de kip op hoog vuur tot licht geroosterd. Haal apart."},
            {"step": 3, "text": "Smelt boter in een pan. Stoof ui met resterende knoflook en gember 5 min."},
            {"step": 4, "text": "Voeg komijn, kurkuma en resterende garam masala toe. Bak 1 min."},
            {"step": 5, "text": "Voeg tomaten en suiker toe. Laat 15 min inkoken. Mix glad met een staafmixer."},
            {"step": 6, "text": "Voeg kip en room toe. Laat 10 min sudderen. Breng op smaak. Serveer met basmatirijst en naan."},
        ],
    },

    {
        "name": "Chili con carne",
        "description": "Pittige Mexicaanse vleessaus met kidneybonen, chipotle, maïs en paprika. Lekker met rijst of nacho's.",
        "prep_time": 15, "cook_time": 50, "total_time": 65,
        "servings": 4, "kcal": 440, "protein": 32.0, "carbs": 38.0, "fat": 16.0, "fiber": 10.0,
        "category": "dinner", "cuisine": "Mexicaans", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "rundergehakt", "amount": 500, "unit": "g", "cat": "Vlees"},
            {"name": "kidneybonen (blik, uitgelekt)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "maïs (blik, uitgelekt)", "amount": 200, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "rode paprika", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "chilipoeder", "amount": 2, "unit": "tl", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 2, "unit": "tl", "cat": "Voorraad"},
            {"name": "gerookt paprikapoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "tomatenpuree", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Stoof ui, paprika en knoflook in olijfolie 5 min."},
            {"step": 2, "text": "Voeg gehakt toe en bak bruin. Voeg tomatenpuree en alle kruiden toe. Bak 1 min."},
            {"step": 3, "text": "Voeg tomaten en 200 ml water toe. Breng aan de kook."},
            {"step": 4, "text": "Laat 30 min sudderen op laag vuur."},
            {"step": 5, "text": "Voeg kidneybonen en maïs toe. Laat nog 10 min koken. Breng op smaak."},
            {"step": 6, "text": "Serveer met rijst of tortillachips, afgewerkt met zure room en koriander."},
        ],
    },

    {
        "name": "Bibimbap",
        "description": "Koreaanse rijstbowl met gemarineerd rundergehakt, roerbakgroenten, een spiegelei en gochujang.",
        "prep_time": 30, "cook_time": 20, "total_time": 50,
        "servings": 4, "kcal": 520, "protein": 28.0, "carbs": 62.0, "fat": 16.0, "fiber": 4.0,
        "category": "dinner", "cuisine": "Koreaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "gestoomde witte rijst", "amount": 400, "unit": "g (droog)", "cat": "Voorraad"},
            {"name": "rundergehakt", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "verse spinazie", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "wortels (in julienne)", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "courgette (in halve maantjes)", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "shiitake paddenstoelen", "amount": 150, "unit": "g", "cat": "Groenten"},
            {"name": "eieren", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "gochujang (Koreaanse chilipasta)", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "sojasaus", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "sesamolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "bruine suiker", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "geroosterd sesamzaad", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Marineer gehakt 15 min in 2 el sojasaus, 1 el sesamolie, suiker en 2 teentjes knoflook."},
            {"step": 2, "text": "Bak elke groente apart kort in sesamolie: spinazie (1 min), wortels (2 min), courgette (2 min), shiitake (3 min). Kruid elk met sojasaus en knoflook."},
            {"step": 3, "text": "Bak het gehakt bruin in een hete pan. Haal apart."},
            {"step": 4, "text": "Bak een spiegelei per persoon met de dooier nog vloeibaar."},
            {"step": 5, "text": "Verdeel rijst in kommen. Rangschik alle groenten en het gehakt erop. Leg het spiegelei bovenop."},
            {"step": 6, "text": "Schep een lepel gochujang in het midden. Bestrooi met sesamzaad en druppel sesamolie erover. Meng alles voor het eten."},
        ],
    },

    {
        "name": "Nasi goreng",
        "description": "Indonesische gebakken rijst met kip, garnalen, sambal en gebakken ei. Snel klaar en bomvol smaak.",
        "prep_time": 15, "cook_time": 15, "total_time": 30,
        "servings": 4, "kcal": 480, "protein": 28.0, "carbs": 56.0, "fat": 14.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Indonesisch", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "gekookte rijst (dag-oud)", "amount": 600, "unit": "g", "cat": "Voorraad"},
            {"name": "kipfilet (in reepjes)", "amount": 250, "unit": "g", "cat": "Vlees"},
            {"name": "garnalen (gepeld)", "amount": 150, "unit": "g", "cat": "Vlees"},
            {"name": "eieren", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "sambal oelek", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "kecap manis (zoete sojasaus)", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "sojasaus", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "lente-uitjes", "amount": 3, "unit": "stuk", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Verhit de wok op hoog vuur met olie. Bak ui en knoflook 1 min."},
            {"step": 2, "text": "Voeg kip toe en bak 3 min. Voeg garnalen en sambal toe, bak nog 2 min."},
            {"step": 3, "text": "Schuif alles opzij, kluts 2 eieren erin en roer tot half gestold. Meng alles samen."},
            {"step": 4, "text": "Voeg de rijst toe in porties. Roerbak op hoog vuur 3 min."},
            {"step": 5, "text": "Voeg kecap manis en sojasaus toe. Meng goed. Breng op smaak."},
            {"step": 6, "text": "Bak de overige eieren apart als spiegeleieren. Leg op de nasi. Garneer met lente-ui en komkommer."},
        ],
    },

    {
        "name": "Tom kha gai",
        "description": "Thaise kokossoep met kip, galanga, citroengras en kaffir limoenblad. Licht, geurig en gezond.",
        "prep_time": 15, "cook_time": 20, "total_time": 35,
        "servings": 4, "kcal": 280, "protein": 24.0, "carbs": 8.0, "fat": 16.0, "fiber": 1.0,
        "category": "soup", "cuisine": "Thais", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": True,
        "ingredients": [
            {"name": "kippenborst (in plakjes)", "amount": 400, "unit": "g", "cat": "Vlees"},
            {"name": "kokosmelk (vol)", "amount": 400, "unit": "ml", "cat": "Voorraad"},
            {"name": "kippenbouillon", "amount": 600, "unit": "ml", "cat": "Voorraad"},
            {"name": "galanga (laos), vers of bevroren", "amount": 20, "unit": "g", "cat": "Groenten"},
            {"name": "citroengras", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "kaffir limoenblaadjes", "amount": 4, "unit": "stuk", "cat": "Voorraad"},
            {"name": "champignons (gehalveerd)", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "vissaus", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "limoensap", "amount": 2, "unit": "el", "cat": "Fruit"},
            {"name": "palmsuiker of bruine suiker", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "rode chili (optioneel)", "amount": 1, "unit": "stuk", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kneus het citroengras met een mes en snijd in stukken. Snijd de galanga in schijfjes."},
            {"step": 2, "text": "Breng bouillon, kokosmelk, citroengras, galanga en limoenblaadjes aan de kook."},
            {"step": 3, "text": "Voeg de champignons toe en laat 5 min koken."},
            {"step": 4, "text": "Voeg de kip toe en laat zachtjes 8-10 min pochen tot gaar."},
            {"step": 5, "text": "Breng op smaak met vissaus, limoensap en suiker. Proef — de soep moet zout, zuur en licht zoet zijn."},
            {"step": 6, "text": "Schep in kommen. Garneer met koriander en eventueel schijfjes chili."},
        ],
    },

    {
        "name": "Pulled pork in de oven",
        "description": "Langzaam gegaard varkensschouder met een kruidenrub, geserveerd als broodje met coleslaw.",
        "prep_time": 20, "cook_time": 270, "total_time": 290,
        "servings": 4, "kcal": 520, "protein": 46.0, "carbs": 28.0, "fat": 22.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Amerikaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "varkensschouder (met bot)", "amount": 1200, "unit": "g", "cat": "Vlees"},
            {"name": "gerookt paprikapoeder", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "bruine suiker", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "knoflookpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "cayennepeper", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "zacht broodjes", "amount": 4, "unit": "stuk", "cat": "Brood"},
            {"name": "wittekool (fijngesneden)", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "wortel (geraspt)", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "mayonaise", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "appelazijn", "amount": 1, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Meng alle droge kruiden voor de rub. Wrijf het vlees er royaal mee in. Laat minstens 2 uur marineren (of nacht)."},
            {"step": 2, "text": "Verwarm oven op 140 °C. Leg het vlees in een ovenschaal met 200 ml water."},
            {"step": 3, "text": "Dek af met aluminiumfolie en gaar 4 à 4,5 uur tot het vlees uit elkaar valt."},
            {"step": 4, "text": "Haal de folie eraf de laatste 30 min om de bovenkant te laten karamelliseren."},
            {"step": 5, "text": "Maak intussen coleslaw: meng kool, wortel, mayonaise, azijn, zout en peper."},
            {"step": 6, "text": "Trek het vlees met twee vorken in draden. Serveer in broodjes met coleslaw."},
        ],
    },

    {
        "name": "Falafel bowl met hummus",
        "description": "Krokante kikkererwten-falafel met zelfgemaakte hummus, tabbouleh, komkommer en verse kruiden.",
        "prep_time": 30, "cook_time": 20, "total_time": 50,
        "servings": 4, "kcal": 480, "protein": 18.0, "carbs": 64.0, "fat": 16.0, "fiber": 12.0,
        "category": "dinner", "cuisine": "Midden-Oosten", "difficulty": "medium",
        "tags": ["vegetarisch"], "is_healthy": False,
        "ingredients": [
            {"name": "gedroogde kikkererwten (nacht geweekt)", "amount": 300, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse peterselie", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "verse koriander", "amount": 0.5, "unit": "bosje", "cat": "Groenten"},
            {"name": "komijnpoeder", "amount": 1.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "korianderzaad (gemalen)", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "kikkererwten uit blik (voor hummus)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "tahini", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen", "amount": 2, "unit": "stuk", "cat": "Fruit"},
            {"name": "komkommer", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "kerstomaatjes", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "rijstolie (voor frituren)", "amount": 500, "unit": "ml", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Maak hummus: mix uitgelekte kikkererwten, tahini, citroenap, knoflook en 4 el water tot een gladde pasta. Breng op smaak."},
            {"step": 2, "text": "Maak falafel: maal de geweekte (niet gekookte!) kikkererwten grof met ui, knoflook, kruiden en specerijen. Niet te fijn."},
            {"step": 3, "text": "Voeg 2 el bloem toe als het mengsel te nat is. Draai balletjes of schijfjes (ø 4 cm)."},
            {"step": 4, "text": "Frituur in olie van 175 °C gedurende 3-4 min tot diepgoudbruin. Of bak in de oven op 200 °C, 25 min."},
            {"step": 5, "text": "Verdeel hummus over kommen. Schik falafel, komkommer en tomaten erop."},
            {"step": 6, "text": "Bedruppel met olijfolie, bestrooi met paprikapoeder. Serveer met pita of flatbread."},
        ],
    },

    {
        "name": "Beef bulgogi",
        "description": "Koreaans gemarineerd rundvlees met peer, sojasaus en sesamolie — supersnel gebakken in de wok.",
        "prep_time": 20, "cook_time": 10, "total_time": 30,
        "servings": 4, "kcal": 380, "protein": 34.0, "carbs": 14.0, "fat": 20.0, "fiber": 1.0,
        "category": "dinner", "cuisine": "Koreaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "runderentrecôte of ribeye (dun gesneden)", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "peer (geraspt)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "sojasaus", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "sesamolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "bruine suiker", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse gember", "amount": 15, "unit": "g", "cat": "Groenten"},
            {"name": "lente-uitjes", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "geroosterd sesamzaad", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Meng peer, sojasaus, sesamolie, suiker, knoflook en gember tot de marinade."},
            {"step": 2, "text": "Snijd het vlees in dunne reepjes (of vraag de slager). Marineer minstens 30 min (liefst 2 uur)."},
            {"step": 3, "text": "Verhit rijstolie in een wok op maximaal vuur."},
            {"step": 4, "text": "Bak het vlees in porties (niet te veel tegelijk) 1-2 min per kant tot mooi gekleurerd."},
            {"step": 5, "text": "Voeg lente-uitjes toe de laatste 30 sec."},
            {"step": 6, "text": "Bestrooi met sesamzaad. Serveer op gestoomde rijst met kimchi."},
        ],
    },

    {
        "name": "Boeuf stroganoff",
        "description": "Russisch klassiek gerecht: mals rundvlees in een romige champignonsaus met paprika en zure room.",
        "prep_time": 15, "cook_time": 25, "total_time": 40,
        "servings": 4, "kcal": 440, "protein": 38.0, "carbs": 10.0, "fat": 26.0, "fiber": 1.0,
        "category": "dinner", "cuisine": "Russisch", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "ossenhaas of biefstuk (in reepjes)", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "champignons (in plakjes)", "amount": 300, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "zure room", "amount": 200, "unit": "ml", "cat": "Zuivel"},
            {"name": "slagroom", "amount": 100, "unit": "ml", "cat": "Zuivel"},
            {"name": "runderbouillon", "amount": 150, "unit": "ml", "cat": "Voorraad"},
            {"name": "paprikapoeder (zoet)", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "Worcestersaus", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kruid het vlees met zout, peper en paprikapoeder. Bak op hoog vuur snel rondom bruin (2 min). Haal apart."},
            {"step": 2, "text": "Bak ui en champignons in boter goudbruin (8 min). Voeg knoflook toe."},
            {"step": 3, "text": "Blus met bouillon en Worcestersaus. Laat 5 min inkoken."},
            {"step": 4, "text": "Haal van het vuur. Roer zure room en slagroom erdoor."},
            {"step": 5, "text": "Leg het vlees terug en verwarm voorzichtig (niet koken, anders schift de room)."},
            {"step": 6, "text": "Breng op smaak. Garneer met peterselie. Serveer met tagliatelle of rijst."},
        ],
    },

    {
        "name": "Lamb rogan josh",
        "description": "Kashmiri lamsstoofschotel met yoghurt, Kashmiri chili's en warme kruiden. Diepvol van smaak.",
        "prep_time": 20, "cook_time": 70, "total_time": 90,
        "servings": 4, "kcal": 420, "protein": 38.0, "carbs": 10.0, "fat": 24.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Indiaas", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "lamsschouder (in blokken van 4 cm)", "amount": 700, "unit": "g", "cat": "Vlees"},
            {"name": "volle yoghurt", "amount": 150, "unit": "ml", "cat": "Zuivel"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse gember", "amount": 20, "unit": "g", "cat": "Groenten"},
            {"name": "Kashmiri chilipoeder (of milde chili)", "amount": 1.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "garam masala", "amount": 2, "unit": "tl", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "venkelzaad", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "kardemomzaadjes (3 peulen)", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "kaneelstokje", "amount": 1, "unit": "stuk", "cat": "Voorraad"},
            {"name": "tomatenpuree", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Marineer lam 1 uur in yoghurt, garam masala en helft van knoflook en gember."},
            {"step": 2, "text": "Verhit olie. Bak kardemom, venkel en kaneel 30 sec. Voeg uien toe en bak goudbruin (15 min)."},
            {"step": 3, "text": "Voeg knoflook, gember, chilipoeder en komijn toe. Bak 2 min. Voeg tomatenpuree toe."},
            {"step": 4, "text": "Voeg het gemarineerde lam toe en bak rondom bruin (5 min)."},
            {"step": 5, "text": "Voeg 200 ml water toe. Breng aan de kook, zet op laag vuur. Stoof 1 uur tot lam zacht is."},
            {"step": 6, "text": "Breng op smaak. Serveer met basmatirijst en naan."},
        ],
    },

    {
        "name": "Gado gado",
        "description": "Indonesische salade van gekookte groenten en ei met een warme, romige pindasaus.",
        "prep_time": 20, "cook_time": 20, "total_time": 40,
        "servings": 4, "kcal": 400, "protein": 18.0, "carbs": 38.0, "fat": 20.0, "fiber": 8.0,
        "category": "dinner", "cuisine": "Indonesisch", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "aardappelen", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "sperziebonen", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "taugé", "amount": 150, "unit": "g", "cat": "Groenten"},
            {"name": "komkommer", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "eieren (hardgekookt)", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "tempe of tofu", "amount": 200, "unit": "g", "cat": "Voorraad"},
            {"name": "pindakaas (100% pinda)", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "kokosmelk", "amount": 100, "unit": "ml", "cat": "Voorraad"},
            {"name": "sojasaus", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "limoensap", "amount": 2, "unit": "el", "cat": "Fruit"},
            {"name": "sambal oelek", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "knoflook", "amount": 1, "unit": "teentje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kook aardappelen gaar (15 min). Blancheer wortels en sperziebonen 4 min. Kook eieren hard. Blancheer taugé 1 min."},
            {"step": 2, "text": "Bak tempe of tofu in plakjes krokant in olie. Kruid licht met sojasaus."},
            {"step": 3, "text": "Maak de pindasaus: verwarm pindakaas, kokosmelk, sojasaus, limoensap, sambal en geperste knoflook op laag vuur. Voeg water toe tot gewenste dikte."},
            {"step": 4, "text": "Rangschik alle groenten, ei en tempe op een schaal of in kommen."},
            {"step": 5, "text": "Giet de warme pindasaus erover vlak voor het serveren."},
        ],
    },

    # ══════════════════════════════════
    # GEZONDE RECEPTEN (20-27)
    # ══════════════════════════════════

    {
        "name": "Broccolisoep met geroosterde amandelen",
        "description": "Fluweelzachte broccolisoep afgewerkt met krokant geroosterde amandelschilfers en een scheutje citroen.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 240, "protein": 10.0, "carbs": 18.0, "fat": 14.0, "fiber": 6.0,
        "category": "soup", "cuisine": "Gezond", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "broccoli", "amount": 800, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "groentenbouillon", "amount": 800, "unit": "ml", "cat": "Voorraad"},
            {"name": "slagroom of kokosroom", "amount": 100, "unit": "ml", "cat": "Zuivel"},
            {"name": "amandelschilfers", "amount": 40, "unit": "g", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 0.5, "unit": "stuk", "cat": "Fruit"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Rooster amandelschilfers in een droge pan goudbruin. Zet apart."},
            {"step": 2, "text": "Stoof ui en knoflook in olijfolie 3 min. Voeg broccoli (in roosjes) en bouillon toe."},
            {"step": 3, "text": "Kook 12-15 minuten tot broccoli zacht is."},
            {"step": 4, "text": "Mix glad met een staafmixer. Roer de room erdoor."},
            {"step": 5, "text": "Breng op smaak met citroenap, zout en peper. Garneer met geroosterde amandelen."},
        ],
    },

    {
        "name": "Rode bietsalade met geitenkaas en walnoten",
        "description": "Geroosterde rode biet op rucola met zachte geitenkaas, walnoten en een zoete balsamicodressing.",
        "prep_time": 15, "cook_time": 40, "total_time": 55,
        "servings": 4, "kcal": 320, "protein": 12.0, "carbs": 22.0, "fat": 20.0, "fiber": 4.0,
        "category": "salad", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "rode bieten", "amount": 600, "unit": "g", "cat": "Groenten"},
            {"name": "rucola", "amount": 100, "unit": "g", "cat": "Groenten"},
            {"name": "zachte geitenkaas", "amount": 150, "unit": "g", "cat": "Kaas"},
            {"name": "walnoten", "amount": 60, "unit": "g", "cat": "Voorraad"},
            {"name": "balsamicoazijn", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "honing", "amount": 1, "unit": "tl", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm oven op 200 °C. Wikkel bieten in aluminiumfolie en rooster 40 min tot gaar. Laat afkoelen, schil en snijd in partjes."},
            {"step": 2, "text": "Rooster walnoten droog in een pan tot licht geroosterd. Laat afkoelen."},
            {"step": 3, "text": "Maak dressing van balsamico, olijfolie, honing, zout en peper."},
            {"step": 4, "text": "Verdeel rucola over borden. Leg de biet erop."},
            {"step": 5, "text": "Verkruimel geitenkaas erover, strooi walnoten erop en druppel de dressing erover."},
        ],
    },

    {
        "name": "Kabeljauw met kappertjes en tomaat",
        "description": "Gebakken kabeljauwfilet in een lichte Mediterrane saus van kerstomaatjes, kappertjes en knoflook.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 280, "protein": 34.0, "carbs": 8.0, "fat": 12.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "kabeljauwfilets", "amount": 4, "unit": "stuk (à 150 g)", "cat": "Vlees"},
            {"name": "kerstomaatjes (gehalveerd)", "amount": 300, "unit": "g", "cat": "Groenten"},
            {"name": "kappertjes (uitgelekt)", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "droge witte wijn", "amount": 100, "unit": "ml", "cat": "Dranken"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kruid de kabeljauw met zout en peper. Bak in olijfolie 3 min per kant tot goudbruin. Haal apart."},
            {"step": 2, "text": "Bak knoflook 30 sec in dezelfde pan. Voeg kerstomaatjes toe en bak 3 min."},
            {"step": 3, "text": "Voeg witte wijn en kappertjes toe. Laat 3 min inkoken."},
            {"step": 4, "text": "Leg de kabeljauw terug in de saus. Laat 2 min warm worden."},
            {"step": 5, "text": "Breng op smaak met citroenap, zout en peper. Garneer met peterselie. Serveer met gestoomde groenten of quinoa."},
        ],
    },

    {
        "name": "Tofu roerbak met bok choy en sesamnoedels",
        "description": "Krokante tofu met bok choy en shiitake in een umami-saus op soba-noedels, bestrooid met sesamzaad.",
        "prep_time": 15, "cook_time": 20, "total_time": 35,
        "servings": 4, "kcal": 360, "protein": 20.0, "carbs": 44.0, "fat": 12.0, "fiber": 5.0,
        "category": "dinner", "cuisine": "Japans", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "stevige tofu", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "bok choy (gehalveerd)", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "shiitake paddenstoelen", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "soba-noedels", "amount": 200, "unit": "g", "cat": "Brood"},
            {"name": "sojasaus", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "sesamolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstazijn", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "verse gember", "amount": 15, "unit": "g", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "geroosterd sesamzaad", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Dep tofu droog en snijd in blokken. Bak in rijstolie op hoog vuur krokant rondom (8 min). Haal apart."},
            {"step": 2, "text": "Kook soba-noedels 4 min, spoel koud en meng met 1 el sesamolie."},
            {"step": 3, "text": "Bak gember en knoflook 30 sec in de wok. Voeg shiitake toe, bak 3 min."},
            {"step": 4, "text": "Voeg bok choy toe en roerbak 2 min. Blus met sojasaus en rijstazijn."},
            {"step": 5, "text": "Voeg tofu en noedels toe. Meng voorzichtig en verwarm 1 min."},
            {"step": 6, "text": "Bestrooi met sesamzaad. Serveer direct."},
        ],
    },

    {
        "name": "Witte bonensoep met rozemarijn",
        "description": "Toscaanse soep van romige cannellini-bonen met rozemarijn, knoflook en Parmezaan. Troostend en voedzaam.",
        "prep_time": 10, "cook_time": 25, "total_time": 35,
        "servings": 4, "kcal": 280, "protein": 14.0, "carbs": 38.0, "fat": 8.0, "fiber": 10.0,
        "category": "soup", "cuisine": "Italiaans", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "cannellini-bonen (2 blikken, uitgelekt)", "amount": 800, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "wortel", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "verse rozemarijn", "amount": 2, "unit": "takjes", "cat": "Voorraad"},
            {"name": "groentenbouillon", "amount": 800, "unit": "ml", "cat": "Voorraad"},
            {"name": "Parmezaan (geraspt)", "amount": 40, "unit": "g", "cat": "Kaas"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 0.5, "unit": "stuk", "cat": "Fruit"},
        ],
        "instructions": [
            {"step": 1, "text": "Stoof ui, wortel, selderij en knoflook in olijfolie 5 min."},
            {"step": 2, "text": "Voeg rozemarijn, bonen en bouillon toe. Breng aan de kook."},
            {"step": 3, "text": "Laat 15 min sudderen. Verwijder rozemarijntakjes."},
            {"step": 4, "text": "Plet 1/3 van de bonen met een vork of staafmixer voor een dikkere textuur."},
            {"step": 5, "text": "Breng op smaak met citroenap, zout en peper. Schep in kommen, bestrooi met Parmezaan en bedruppel met olijfolie."},
        ],
    },

    {
        "name": "Kipfilet met pesto en geroosterde paprika",
        "description": "Sappige gegrilde kipfilet met basilicumpesto op een bedje van geroosterde paprika's en rucola.",
        "prep_time": 15, "cook_time": 20, "total_time": 35,
        "servings": 4, "kcal": 340, "protein": 36.0, "carbs": 8.0, "fat": 18.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": True,
        "ingredients": [
            {"name": "kipfilets", "amount": 4, "unit": "stuk (à 150 g)", "cat": "Vlees"},
            {"name": "groene basilicumpesto", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "rode paprika's", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "gele paprika", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "rucola", "amount": 80, "unit": "g", "cat": "Groenten"},
            {"name": "Parmezaan (geschaafd)", "amount": 30, "unit": "g", "cat": "Kaas"},
            {"name": "pijnboompitten", "amount": 30, "unit": "g", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm oven op grill. Halveer paprika's, verwijder zaadjes. Rooster 15-20 min tot de schil blakert. Pel en snijd in repen."},
            {"step": 2, "text": "Rooster pijnboompitten droog goudbruin in een pan."},
            {"step": 3, "text": "Kruid de kipfilets met zout en peper. Bestrijk met 2 el pesto."},
            {"step": 4, "text": "Gril de kip 5-6 min per kant op een grillpan of in de oven op 200 °C."},
            {"step": 5, "text": "Verdeel rucola en paprikarepen over borden. Leg de kipfilet erop."},
            {"step": 6, "text": "Schep de resterende pesto erop. Garneer met Parmezaan en pijnboompitten."},
        ],
    },

    {
        "name": "Groene aspergesoep met munt",
        "description": "Lichte, fluweelzachte soep van groene asperges met verse munt en een scheutje crème fraîche.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 180, "protein": 6.0, "carbs": 14.0, "fat": 10.0, "fiber": 4.0,
        "category": "soup", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "groene asperges", "amount": 600, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 1, "unit": "teentje", "cat": "Groenten"},
            {"name": "groentenbouillon", "amount": 800, "unit": "ml", "cat": "Voorraad"},
            {"name": "verse munt", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "crème fraîche", "amount": 80, "unit": "ml", "cat": "Zuivel"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 0.5, "unit": "stuk", "cat": "Fruit"},
        ],
        "instructions": [
            {"step": 1, "text": "Breek de houtige uiteinden van de asperges. Snijd de topjes af en zet apart."},
            {"step": 2, "text": "Stoof ui en knoflook in olijfolie 3 min. Voeg aspergestal (zonder topjes) en bouillon toe."},
            {"step": 3, "text": "Laat 12 min koken tot de asperges gaar zijn."},
            {"step": 4, "text": "Blancheer de aspergetopjes apart 2 min. Haal uit het water en zet apart."},
            {"step": 5, "text": "Voeg het merendeel van de munt toe aan de soep. Mix glad."},
            {"step": 6, "text": "Breng op smaak met citroenap, zout en peper. Schep in kommen met een lepel crème fraîche, de topjes en verse munt."},
        ],
    },

    {
        "name": "Mediterrane tonijnsalade",
        "description": "Kleurrijke salade van tonijn, kikkererwten, komkommer, olijven en feta met een citroendressing.",
        "prep_time": 15, "cook_time": 0, "total_time": 15,
        "servings": 4, "kcal": 300, "protein": 26.0, "carbs": 22.0, "fat": 12.0, "fiber": 6.0,
        "category": "salad", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "tonijn in olijfolie (uitgelekt)", "amount": 320, "unit": "g (4 blikjes)", "cat": "Vlees"},
            {"name": "kikkererwten (blik, uitgelekt)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "komkommer", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "kerstomaatjes (gehalveerd)", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "zwarte olijven (ontpit)", "amount": 80, "unit": "g", "cat": "Voorraad"},
            {"name": "rode ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "feta (verkruimeld)", "amount": 100, "unit": "g", "cat": "Kaas"},
            {"name": "rucola of veldsla", "amount": 80, "unit": "g", "cat": "Groenten"},
            {"name": "citroen (sap + zest)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Snijd komkommer in halve maantjes. Snijd rode ui dun. Halveer tomaten."},
            {"step": 2, "text": "Maak dressing van citroenap, citroenzest, olijfolie, zout en peper."},
            {"step": 3, "text": "Meng kikkererwten, komkommer, tomaten, olijven en rode ui in een grote kom."},
            {"step": 4, "text": "Voeg de tonijn toe en schep voorzichtig om (niet te fijn breken)."},
            {"step": 5, "text": "Verdeel rucola over de borden. Schep de salade erop. Verkruimel feta erover en bedruppel met de dressing."},
            {"step": 6, "text": "Garneer met verse peterselie. Serveer met vers brood."},
        ],
    },
]


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    api_url = sys.argv[1].rstrip("/")
    email = sys.argv[2]
    password = sys.argv[3]

    print(f"Inloggen als {email}...")
    try:
        token = login(api_url, email, password)
        print("Ingelogd.")
    except Exception as e:
        print(f"Inloggen mislukt: {e}")
        sys.exit(1)

    print(f"Importeren van {len(RECIPES)} recepten...")
    try:
        result = batch_import(api_url, token, RECIPES)
        print(f"\nKlaar! {len(result)} recepten toegevoegd aan de catalogus:")
        for r in result:
            print(f"  ✓ {r['name']}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Fout {e.code}: {body}")
        sys.exit(1)
    except Exception as e:
        print(f"Fout: {e}")
        sys.exit(1)
