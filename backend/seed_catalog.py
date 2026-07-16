#!/usr/bin/env python3
"""
Seed de catalogus met 30 startrecepten.

Gebruik:
  python seed_catalog.py <api_url> <email> <password>

Voorbeeld:
  python seed_catalog.py https://mise-en-place-xxxx.onrender.com dietvandevelde@gmail.com mijnwachtwoord
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


# ─────────────────────────────────────────────────────────────────────────────
# 30 CATALOGUSRECEPTEN
# Verwijder recepten die je NIET wilt importeren voordat je het script uitvoert.
# ─────────────────────────────────────────────────────────────────────────────
RECIPES = [

    # ══════════════════════════════════
    # BELGISCHE KLASSIEKERS (1-10)
    # ══════════════════════════════════

    {
        "name": "Waterzooi van kip",
        "description": "De Gentse klassieker: een romige bouillon vol groenten en malse kip, afgemaakt met room en eidooiers.",
        "prep_time": 20, "cook_time": 40, "total_time": 60,
        "servings": 4, "kcal": 420, "protein": 38.0, "carbs": 24.0, "fat": 16.0, "fiber": 4.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kippenborst", "amount": 800, "unit": "g", "cat": "Vlees"},
            {"name": "wortels", "amount": 3, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "prei", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "aardappelen", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "kippenbouillon", "amount": 1000, "unit": "ml", "cat": "Voorraad"},
            {"name": "slagroom", "amount": 150, "unit": "ml", "cat": "Zuivel"},
            {"name": "eidooiers", "amount": 3, "unit": "stuk", "cat": "Zuivel"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
            {"name": "verse peterselie", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Schil en snijd wortels, aardappelen en ui. Snijd prei en bleekselderij in ringen."},
            {"step": 2, "text": "Smelt boter in een grote soeppan. Stoof ui en bleekselderij 3 minuten op middelhoog vuur."},
            {"step": 3, "text": "Voeg kippenbouillon toe, breng aan de kook. Voeg wortels, prei en aardappelen toe."},
            {"step": 4, "text": "Voeg de kip toe en laat 25 minuten sudderen op laag vuur tot de kip gaar is."},
            {"step": 5, "text": "Haal de kip uit de pan en trek in grove stukken met twee vorken."},
            {"step": 6, "text": "Klop eidooiers met slagroom samen. Haal de pan van het vuur en roer dit mengsel erdoor."},
            {"step": 7, "text": "Leg de kip terug en verwarm voorzichtig (niet meer koken). Breng op smaak met zout en peper."},
            {"step": 8, "text": "Schep in diepe borden en garneer met vers gehakte peterselie."},
        ],
    },

    {
        "name": "Vlaamse stoofkarbonade",
        "description": "Het ultieme comfort food: malse rundvleesstukken gestoofd in Belgisch bruin bier met mosterd en bruine suiker.",
        "prep_time": 20, "cook_time": 120, "total_time": 140,
        "servings": 4, "kcal": 510, "protein": 36.0, "carbs": 26.0, "fat": 22.0, "fiber": 1.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "rundercarbonade (stoofvlees)", "amount": 800, "unit": "g", "cat": "Vlees"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "Belgisch bruin bier (Leffe Brune of Chimay)", "amount": 660, "unit": "ml", "cat": "Dranken"},
            {"name": "witbrood", "amount": 2, "unit": "sneden", "cat": "Brood"},
            {"name": "grove mosterd", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "bruine suiker", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "verse tijm", "amount": 3, "unit": "takjes", "cat": "Voorraad"},
            {"name": "laurierblaadjes", "amount": 2, "unit": "stuk", "cat": "Voorraad"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
        ],
        "instructions": [
            {"step": 1, "text": "Snijd het vlees in blokken van 4 cm. Kruid royaal met zout en peper."},
            {"step": 2, "text": "Verhit boter in een zware stoofpan. Braad het vlees in porties rondom goudbruin aan. Zet apart."},
            {"step": 3, "text": "Bak de gesnipperde uien in dezelfde pan goudgeel (5 minuten). Voeg de suiker toe."},
            {"step": 4, "text": "Leg het vlees terug in de pan. Giet het bier erover. Voeg tijm en laurier toe."},
            {"step": 5, "text": "Bestrijk de boterhammen dik met mosterd en leg ze bovenop het vlees (mosterd naar beneden)."},
            {"step": 6, "text": "Breng aan de kook, zet dan het vuur laag. Laat 1,5 à 2 uur sudderen met deksel half op de pan."},
            {"step": 7, "text": "De boterhammen lossen op en binden de saus. Roer af en toe. Breng op smaak met zout en peper."},
            {"step": 8, "text": "Serveer met frieten of stoemp."},
        ],
    },

    {
        "name": "Stoemp met wortel en spek",
        "description": "Een Brusselse klassieker: geplette aardappelen met wortels en knapperig gerookt spek.",
        "prep_time": 15, "cook_time": 30, "total_time": 45,
        "servings": 4, "kcal": 420, "protein": 18.0, "carbs": 46.0, "fat": 18.0, "fiber": 5.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "aardappelen (bloemig)", "amount": 800, "unit": "g", "cat": "Groenten"},
            {"name": "wortels", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "gerookte spekreepjes", "amount": 200, "unit": "g", "cat": "Vlees"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "volle melk", "amount": 100, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 50, "unit": "g", "cat": "Zuivel"},
            {"name": "muskaatnoot", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Schil aardappelen en wortels, snijd in gelijke stukken. Kook samen gaar in gezouten water (±25 min)."},
            {"step": 2, "text": "Bak ondertussen de spekreepjes met gesnipperde ui in een droge pan knapperig. Zet opzij."},
            {"step": 3, "text": "Giet aardappelen en wortels af. Stamp fijn met boter en warme melk."},
            {"step": 4, "text": "Roer het spek en de ui door de stoemp. Kruid met muskaatnoot, zout en peper."},
            {"step": 5, "text": "Serveer met een spiegelei of worst naar keuze."},
        ],
    },

    {
        "name": "Gegratineerde witloof met hesp",
        "description": "Witloofstronken gewikkeld in hesp, overgoten met kaassaus en gegratineerd in de oven.",
        "prep_time": 20, "cook_time": 40, "total_time": 60,
        "servings": 4, "kcal": 380, "protein": 24.0, "carbs": 20.0, "fat": 22.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "witloofstronken", "amount": 8, "unit": "stuk", "cat": "Groenten"},
            {"name": "gekookte hesp (ham)", "amount": 8, "unit": "plakken", "cat": "Vlees"},
            {"name": "gruyère (geraspt)", "amount": 100, "unit": "g", "cat": "Kaas"},
            {"name": "volle melk", "amount": 400, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 40, "unit": "g", "cat": "Zuivel"},
            {"name": "bloem", "amount": 40, "unit": "g", "cat": "Voorraad"},
            {"name": "muskaatnoot", "amount": 1, "unit": "snufje", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm de oven voor op 200 °C. Kook de witloofstronken 10 minuten in gezouten water. Giet af en dep droog."},
            {"step": 2, "text": "Maak een béchamelsaus: smelt boter, voeg bloem toe en bak 1 minuut. Klop er de melk bij en roer tot een gladde saus. Kruid met muskaatnoot, zout en peper."},
            {"step": 3, "text": "Wikkel elke stronk witloof in een plak hesp. Leg ze naast elkaar in een ingevette ovenschaal."},
            {"step": 4, "text": "Giet de béchamelsaus over het witloof. Bestrooi met geraspte gruyère."},
            {"step": 5, "text": "Bak 25-30 minuten in de oven tot de kaas goudbruin is en de saus borrelt."},
        ],
    },

    {
        "name": "Vol-au-vent",
        "description": "Romig kipragout met champignons in een knapperig bladerdeegschaaltje, een tijdloze Belgische feestklassieker.",
        "prep_time": 25, "cook_time": 35, "total_time": 60,
        "servings": 4, "kcal": 490, "protein": 26.0, "carbs": 34.0, "fat": 28.0, "fiber": 1.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "bladerdeegschaaltjes (vol-au-vent)", "amount": 4, "unit": "stuk", "cat": "Brood"},
            {"name": "kippenborst (gekookt en gesneden)", "amount": 400, "unit": "g", "cat": "Vlees"},
            {"name": "champignons", "amount": 250, "unit": "g", "cat": "Groenten"},
            {"name": "kippenbouillon", "amount": 250, "unit": "ml", "cat": "Voorraad"},
            {"name": "slagroom", "amount": 150, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 40, "unit": "g", "cat": "Zuivel"},
            {"name": "bloem", "amount": 40, "unit": "g", "cat": "Voorraad"},
            {"name": "eidooier", "amount": 1, "unit": "stuk", "cat": "Zuivel"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm de oven voor op 180 °C en warm de bladerdeegschaaltjes op volgens de verpakking."},
            {"step": 2, "text": "Bak de gesneden champignons in de helft van de boter goudbruin. Zet apart."},
            {"step": 3, "text": "Maak de saus: smelt resterende boter, voeg bloem toe. Klop er bouillon bij en roer tot gladde saus."},
            {"step": 4, "text": "Voeg slagroom toe en laat 5 minuten zachtjes koken. Haal van het vuur en roer eidooier erdoor."},
            {"step": 5, "text": "Voeg kip en champignons toe. Breng op smaak met zout, peper en peterselie."},
            {"step": 6, "text": "Schep de ragout in de warme bladerdeegschaaltjes en serveer onmiddellijk."},
        ],
    },

    {
        "name": "Mosselen in witte wijn",
        "description": "Verse Zeeuwse mosselen gestoomd met droge witte wijn, bleekselderij en knoflook. Klassiek met friet.",
        "prep_time": 15, "cook_time": 10, "total_time": 25,
        "servings": 4, "kcal": 220, "protein": 18.0, "carbs": 8.0, "fat": 8.0, "fiber": 1.0,
        "category": "dinner", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "mosselen (gepoetst)", "amount": 2000, "unit": "g", "cat": "Vlees"},
            {"name": "droge witte wijn", "amount": 200, "unit": "ml", "cat": "Dranken"},
            {"name": "bleekselderij", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse tijm", "amount": 3, "unit": "takjes", "cat": "Voorraad"},
            {"name": "boter", "amount": 40, "unit": "g", "cat": "Zuivel"},
            {"name": "verse peterselie", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Spoel de mosselen onder koud water. Verwijder gebroken of open mosselen die niet sluiten als je erop klopt."},
            {"step": 2, "text": "Smelt boter in een grote pot. Stoof gesneden ui, bleekselderij en knoflook 2 minuten."},
            {"step": 3, "text": "Giet de witte wijn erbij en voeg tijm toe. Breng aan de kook."},
            {"step": 4, "text": "Voeg de mosselen toe en doe het deksel erop. Laat op hoog vuur 5-7 minuten stomen, schud de pot af en toe."},
            {"step": 5, "text": "De mosselen zijn gaar als ze allemaal open zijn. Gooi gesloten mosselen weg."},
            {"step": 6, "text": "Schep in grote kommen, overgiet met het vocht en garneer met peterselie."},
        ],
    },

    {
        "name": "Erwtensoep",
        "description": "Dikke, voedzame soep met spliterwten, rookspek en groenten. Klassiek Belgisch wintergerecht.",
        "prep_time": 15, "cook_time": 90, "total_time": 105,
        "servings": 4, "kcal": 380, "protein": 22.0, "carbs": 52.0, "fat": 8.0, "fiber": 14.0,
        "category": "soup", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": True,
        "ingredients": [
            {"name": "spliterwten (groen)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "rookspek (aan één stuk)", "amount": 200, "unit": "g", "cat": "Vlees"},
            {"name": "prei", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "bleekselderij", "amount": 2, "unit": "stengels", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "groentenbouillon", "amount": 1500, "unit": "ml", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Spoel de spliterwten. Week ze niet — ze zijn niet nodig voor spliterwten."},
            {"step": 2, "text": "Doe alles behalve prei in de pot: spliterwten, spek, bouillon, gesneden wortels, bleekselderij en ui. Breng aan de kook."},
            {"step": 3, "text": "Schuim af, zet het vuur laag en laat 1 uur sudderen met deksel."},
            {"step": 4, "text": "Haal het spek eruit, snijd in blokjes en zet apart."},
            {"step": 5, "text": "Roer de soep goed door — de erwten lossen gedeeltelijk op en maken de soep dik. Voeg prei toe en kook nog 15 minuten."},
            {"step": 6, "text": "Roer de spekblokjes erdoor. Breng op smaak met peper (nauwelijks zout nodig door het spek)."},
        ],
    },

    {
        "name": "Gevulde tomaten met garnaalsalade",
        "description": "Grote rijpe tomaten gevuld met verse grijze garnalen, mayonaise en een vleugje citroen.",
        "prep_time": 20, "cook_time": 0, "total_time": 20,
        "servings": 4, "kcal": 220, "protein": 16.0, "carbs": 8.0, "fat": 14.0, "fiber": 2.0,
        "category": "lunch", "cuisine": "Belgische klassiekers", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "grote tomaten", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "grijze garnalen (gepeld)", "amount": 200, "unit": "g", "cat": "Vlees"},
            {"name": "mayonaise", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "verse room", "amount": 1, "unit": "el", "cat": "Zuivel"},
            {"name": "citroen", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
            {"name": "sla (voor garnering)", "amount": 4, "unit": "blaadjes", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Snijd de tomatenhoedjes af. Hol de tomaten voorzichtig uit met een lepel. Bestrooi de binnenkant met een snufje zout en laat omgekeerd 10 minuten uitlekken."},
            {"step": 2, "text": "Meng garnalen met mayonaise, room, citroensap en gehakte peterselie. Breng op smaak."},
            {"step": 3, "text": "Leg een slablaadje in elke tomaat en vul met de garnaalsalade. Leg het hoedje schuin erop."},
            {"step": 4, "text": "Serveer koud, eventueel met brood of frietjes."},
        ],
    },

    # ══════════════════════════════════
    # WERELDKEUKEN (11-22)
    # ══════════════════════════════════

    {
        "name": "Spaghetti carbonara",
        "description": "De echte Romeinse carbonara zonder room: spaghetti met guanciale, eidooiers en Pecorino Romano.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 620, "protein": 28.0, "carbs": 68.0, "fat": 24.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Italiaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "spaghetti", "amount": 400, "unit": "g", "cat": "Brood"},
            {"name": "guanciale of pancetta", "amount": 200, "unit": "g", "cat": "Vlees"},
            {"name": "eidooiers", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "ei (heel)", "amount": 2, "unit": "stuk", "cat": "Zuivel"},
            {"name": "Pecorino Romano (geraspt)", "amount": 100, "unit": "g", "cat": "Kaas"},
            {"name": "zwarte peper (grof gemalen)", "amount": 2, "unit": "tl", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Kook spaghetti in ruim gezouten water al dente. Houd 200 ml pastawater apart."},
            {"step": 2, "text": "Bak guanciale in blokjes in een koude pan zonder olie tot knapperig. Zet opzij, bewaar het vet."},
            {"step": 3, "text": "Klop eidooiers, hele eieren en Pecorino samen. Kruid met veel zwarte peper."},
            {"step": 4, "text": "Giet de pasta af en voeg direct bij de pan met het guanciale (van het vuur). Meng goed."},
            {"step": 5, "text": "Schuif de pan van het vuur. Giet het eimengsel erbij en voeg scheutje voor scheutje pastawater toe terwijl je roert."},
            {"step": 6, "text": "De saus moet zijdezacht zijn, niet gestold. Serveer direct met extra Pecorino en peper."},
        ],
    },

    {
        "name": "Risotto met paddenstoelen",
        "description": "Romige Italiaanse risotto met gemengde paddenstoelen, Parmezaan en een scheutje witte wijn.",
        "prep_time": 15, "cook_time": 30, "total_time": 45,
        "servings": 4, "kcal": 480, "protein": 14.0, "carbs": 72.0, "fat": 14.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Italiaans", "difficulty": "medium",
        "tags": ["vegetarisch"], "is_healthy": False,
        "ingredients": [
            {"name": "Arborio risottorijst", "amount": 320, "unit": "g", "cat": "Voorraad"},
            {"name": "gemengde paddenstoelen", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "droge witte wijn", "amount": 150, "unit": "ml", "cat": "Dranken"},
            {"name": "groentenbouillon (warm)", "amount": 1200, "unit": "ml", "cat": "Voorraad"},
            {"name": "Parmezaan (geraspt)", "amount": 80, "unit": "g", "cat": "Kaas"},
            {"name": "boter (koud)", "amount": 30, "unit": "g", "cat": "Zuivel"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Bak de paddenstoelen in een scheutje olijfolie op hoog vuur goudbruin. Kruid en zet apart."},
            {"step": 2, "text": "Stoof ui en knoflook glazig in de rest van de olijfolie. Voeg de rijst toe en bak 1 minuut mee."},
            {"step": 3, "text": "Blus met witte wijn en roer tot de wijn geabsorbeerd is."},
            {"step": 4, "text": "Voeg soeplepel per soeplepel warme bouillon toe, roer telkens tot geabsorbeerd (totaal ±20 min)."},
            {"step": 5, "text": "Roer de paddenstoelen door de risotto. Haal van het vuur."},
            {"step": 6, "text": "Roer koude boter en Parmezaan erdoor (mantecatura). Laat 1 minuut rusten en serveer."},
        ],
    },

    {
        "name": "Coq au vin",
        "description": "Frans stoofgerecht van kip met rode wijn, spekreepjes, champignons en wortelgroenten.",
        "prep_time": 30, "cook_time": 90, "total_time": 120,
        "servings": 4, "kcal": 520, "protein": 44.0, "carbs": 14.0, "fat": 26.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Frans", "difficulty": "hard",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kip (in stukken)", "amount": 1400, "unit": "g", "cat": "Vlees"},
            {"name": "rode wijn (Bourgogne)", "amount": 750, "unit": "ml", "cat": "Dranken"},
            {"name": "spekreepjes", "amount": 150, "unit": "g", "cat": "Vlees"},
            {"name": "champignons", "amount": 250, "unit": "g", "cat": "Groenten"},
            {"name": "sjalotten", "amount": 8, "unit": "stuk", "cat": "Groenten"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "tomatenpuree", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "bloem", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "boter", "amount": 30, "unit": "g", "cat": "Zuivel"},
            {"name": "verse tijm", "amount": 3, "unit": "takjes", "cat": "Voorraad"},
            {"name": "laurierblaadjes", "amount": 2, "unit": "stuk", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Marineer de kip 2-4 uur in rode wijn met kruiden en knoflook (optioneel maar aanbevolen)."},
            {"step": 2, "text": "Dep de kip droog. Bestuif met bloem. Braad aan in boter + spek tot goudbruin. Haal apart."},
            {"step": 3, "text": "Bak sjalotten en wortels in het braadvet. Voeg knoflook en tomatenpuree toe, bak 1 minuut."},
            {"step": 4, "text": "Leg de kip terug. Giet de (marinade)wijn erover. Voeg tijm en laurier toe. Breng aan de kook."},
            {"step": 5, "text": "Zet het vuur laag en laat 1 uur sudderen met deksel. Bak champignons apart in boter."},
            {"step": 6, "text": "Voeg champignons toe voor de laatste 15 minuten. Breng op smaak, garneer met peterselie."},
        ],
    },

    {
        "name": "Kiptajine met citroen en olijven",
        "description": "Marokkaanse tajine met malse kippendijen, ingelegde citroen, groene olijven en warme kruiden.",
        "prep_time": 20, "cook_time": 50, "total_time": 70,
        "servings": 4, "kcal": 380, "protein": 38.0, "carbs": 8.0, "fat": 22.0, "fiber": 2.0,
        "category": "dinner", "cuisine": "Marokkaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kippendijen (zonder bot)", "amount": 800, "unit": "g", "cat": "Vlees"},
            {"name": "ingelegde citroen", "amount": 2, "unit": "stuk", "cat": "Fruit"},
            {"name": "groene olijven (ontpit)", "amount": 100, "unit": "g", "cat": "Voorraad"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "komijnzaad", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "korianderzaad (gemalen)", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "kurkuma", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "gemberpoeder", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Marineer de kip 30 min met olijfolie, knoflook, komijn, koriander, kurkuma en gember."},
            {"step": 2, "text": "Bak de kip aan in een stoofpan of tajine tot goudbruin. Haal apart."},
            {"step": 3, "text": "Stoof de gesneden uien glazig in dezelfde pan (10 minuten)."},
            {"step": 4, "text": "Leg de kip terug. Voeg 200 ml water toe. Breng aan de kook, zet op laag vuur."},
            {"step": 5, "text": "Voeg ingelegde citroen (enkel de schil, fijngesneden) en olijven toe. Sudder 30 minuten."},
            {"step": 6, "text": "Garneer met verse koriander. Serveer met couscous of Marokkaans brood."},
        ],
    },

    {
        "name": "Pad Thai met garnalen",
        "description": "Thaise rijstnoedels met garnalen, ei, tauge en een smaakvolle saus van tamarinde en vissaus.",
        "prep_time": 20, "cook_time": 15, "total_time": 35,
        "servings": 4, "kcal": 480, "protein": 24.0, "carbs": 62.0, "fat": 14.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Thais", "difficulty": "medium",
        "tags": ["vis"], "is_healthy": False,
        "ingredients": [
            {"name": "brede rijstnoedels", "amount": 200, "unit": "g", "cat": "Brood"},
            {"name": "rauwe garnalen (gepeld)", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "eieren", "amount": 3, "unit": "stuk", "cat": "Zuivel"},
            {"name": "tauge", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "lente-uitjes", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "vissaus", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "tamarindepasta", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "bruine suiker", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "geroosterde pinda's (gehakt)", "amount": 80, "unit": "g", "cat": "Voorraad"},
            {"name": "limoen", "amount": 2, "unit": "stuk", "cat": "Fruit"},
        ],
        "instructions": [
            {"step": 1, "text": "Week de rijstnoedels 20 minuten in lauw water tot zacht. Giet af."},
            {"step": 2, "text": "Meng vissaus, tamarinde en suiker tot de saus. Proef en pas aan."},
            {"step": 3, "text": "Verhit de wok op hoog vuur met olie. Bak knoflook en garnalen 2 minuten."},
            {"step": 4, "text": "Duw alles opzij, kluts de eieren erin en roer tot half gestold. Meng met de garnalen."},
            {"step": 5, "text": "Voeg de noedels en de saus toe. Roerbak 2-3 minuten tot alles goed vermengd is."},
            {"step": 6, "text": "Voeg tauge toe, roer nog 1 minuut. Verdeel over borden en garneer met pinda's, lente-ui en limoen."},
        ],
    },

    {
        "name": "Zoete aardappelcurry met kikkererwten",
        "description": "Rijke Indiase curry met zoete aardappelen en kikkererwten in kokosmelk, volledig plantaardig.",
        "prep_time": 15, "cook_time": 25, "total_time": 40,
        "servings": 4, "kcal": 380, "protein": 14.0, "carbs": 56.0, "fat": 12.0, "fiber": 10.0,
        "category": "dinner", "cuisine": "Indiaas", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "zoete aardappelen", "amount": 600, "unit": "g", "cat": "Groenten"},
            {"name": "kikkererwten (uit blik, uitgelekt)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "kokosmelk (vol)", "amount": 400, "unit": "ml", "cat": "Voorraad"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse gember", "amount": 20, "unit": "g", "cat": "Groenten"},
            {"name": "kerriepoeder", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "verse spinazie", "amount": 100, "unit": "g", "cat": "Groenten"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Schil zoete aardappelen en snijd in blokjes van 2 cm."},
            {"step": 2, "text": "Stoof ui, knoflook en gember in olie 3 minuten. Voeg kerriepoeder en komijn toe, bak 1 minuut."},
            {"step": 3, "text": "Voeg zoete aardappelen, tomaten en kokosmelk toe. Breng aan de kook."},
            {"step": 4, "text": "Laat 15 minuten sudderen tot de aardappelen gaar zijn."},
            {"step": 5, "text": "Voeg kikkererwten toe en verwarm 5 minuten. Roer spinazie erdoor tot geslonken."},
            {"step": 6, "text": "Garneer met koriander. Serveer met basmatirijst of naanbrood."},
        ],
    },

    {
        "name": "Shakshuka",
        "description": "Gepocheerde eieren in een pittige Midden-Oosterse saus van tomaten, paprika en kruiden.",
        "prep_time": 10, "cook_time": 25, "total_time": 35,
        "servings": 4, "kcal": 290, "protein": 18.0, "carbs": 16.0, "fat": 16.0, "fiber": 4.0,
        "category": "dinner", "cuisine": "Midden-Oosten", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "eieren", "amount": 8, "unit": "stuk", "cat": "Zuivel"},
            {"name": "gepelde tomaten (blik)", "amount": 800, "unit": "g", "cat": "Voorraad"},
            {"name": "rode paprika's", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "komijnpoeder", "amount": 2, "unit": "tl", "cat": "Voorraad"},
            {"name": "gerookt paprikapoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "cayennepeper", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "feta", "amount": 100, "unit": "g", "cat": "Kaas"},
            {"name": "verse koriander of peterselie", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Bak gesneden ui en paprika in olijfolie 8 minuten. Voeg knoflook en kruiden toe, bak 1 minuut."},
            {"step": 2, "text": "Voeg de tomaten toe, breng aan de kook. Laat 10 minuten inkoken."},
            {"step": 3, "text": "Maak met een lepel 8 kuiltjes in de saus. Breek in elk kuiltje een ei."},
            {"step": 4, "text": "Doe het deksel op de pan en laat op laag vuur 5-8 minuten pocheren tot het eiwit gestold is maar de dooier zacht."},
            {"step": 5, "text": "Verkruimel feta erover en garneer met verse kruiden. Serveer met pitabrood."},
        ],
    },

    {
        "name": "Taco's met pulled chicken",
        "description": "Zachte maistaco's met in kruiden gestoofde kip, avocado, koriander en een squeeze limoen.",
        "prep_time": 15, "cook_time": 40, "total_time": 55,
        "servings": 4, "kcal": 480, "protein": 36.0, "carbs": 44.0, "fat": 16.0, "fiber": 6.0,
        "category": "dinner", "cuisine": "Mexicaans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kippenborst", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "kleine maistortilla's", "amount": 8, "unit": "stuk", "cat": "Brood"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "chipotle in adobosaus", "amount": 2, "unit": "pepers", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "avocado's", "amount": 2, "unit": "stuk", "cat": "Fruit"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "limoenen", "amount": 2, "unit": "stuk", "cat": "Fruit"},
            {"name": "rodekool (fijngehakt)", "amount": 150, "unit": "g", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Leg kippenborst in een pan met tomaten, chipotle, ui, knoflook en komijn. Breng aan de kook."},
            {"step": 2, "text": "Laat 30-35 minuten sudderen op laag vuur tot de kip volledig gaar en mals is."},
            {"step": 3, "text": "Haal de kip eruit en trek in draden met twee vorken. Meng terug door de saus."},
            {"step": 4, "text": "Maak guacamole: prak avocado met limoensap, zout en koriander."},
            {"step": 5, "text": "Warm de tortilla's op in een droge pan of magnetron."},
            {"step": 6, "text": "Vul elke tortilla met pulled chicken, guacamole, rodekool en verse koriander. Squeeze limoen erover."},
        ],
    },

    {
        "name": "Griekse moussaka",
        "description": "Gelaagd Grieks stoofgerecht met aubergine, gehakt en een romige bechamelsaus.",
        "prep_time": 40, "cook_time": 60, "total_time": 100,
        "servings": 4, "kcal": 560, "protein": 32.0, "carbs": 34.0, "fat": 30.0, "fiber": 5.0,
        "category": "dinner", "cuisine": "Grieks", "difficulty": "hard",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "lams- of rundergehakt", "amount": 500, "unit": "g", "cat": "Vlees"},
            {"name": "aubergines", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "aardappelen", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "kaneel", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "allspice (piment)", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "volle melk", "amount": 400, "unit": "ml", "cat": "Zuivel"},
            {"name": "boter", "amount": 40, "unit": "g", "cat": "Zuivel"},
            {"name": "bloem", "amount": 40, "unit": "g", "cat": "Voorraad"},
            {"name": "eieren", "amount": 2, "unit": "stuk", "cat": "Zuivel"},
            {"name": "Kefalotiri of Parmezaan (geraspt)", "amount": 80, "unit": "g", "cat": "Kaas"},
            {"name": "olijfolie", "amount": 4, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Snijd aubergines in schijven van 1 cm. Bestrooi met zout, laat 20 min uitlekken. Spoel en dep droog."},
            {"step": 2, "text": "Gril aubergineschijven in olijfolie tot goudbruin. Kook aardappelen ongepeld 15 min, schil en snijd in schijven."},
            {"step": 3, "text": "Bak ui en knoflook. Voeg gehakt toe en bak bruin. Voeg tomaten, kaneel en allspice toe. Laat 20 min sudderen."},
            {"step": 4, "text": "Maak béchamel: boter + bloem, klop melk erdoor. Koel iets af. Klop eieren erdoor."},
            {"step": 5, "text": "Leg aardappelen op de bodem van een ovenschaal, dan aubergine, dan het vleesmengsel, dan nog een laag aubergine."},
            {"step": 6, "text": "Giet de béchamel erover, bestrooi met kaas. Bak 45 min op 180 °C tot goudbruin. Laat 15 min rusten."},
        ],
    },

    {
        "name": "Miso ramen met zachtgekookt ei",
        "description": "Japanse ramen met rijke misosaus, buikspek, paksoi en een gemarineerd zachtgekookt ei.",
        "prep_time": 20, "cook_time": 40, "total_time": 60,
        "servings": 4, "kcal": 520, "protein": 30.0, "carbs": 54.0, "fat": 18.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Japans", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "ramennoodles", "amount": 320, "unit": "g", "cat": "Brood"},
            {"name": "varkensbuik (in plakken)", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "kippenbouillon", "amount": 1200, "unit": "ml", "cat": "Voorraad"},
            {"name": "witte miso", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "sojasaus", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "sesamolie", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "eieren", "amount": 4, "unit": "stuk", "cat": "Zuivel"},
            {"name": "paksoi", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "lente-uitjes", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "nori (zeewier)", "amount": 4, "unit": "vellen", "cat": "Voorraad"},
            {"name": "verse gember", "amount": 10, "unit": "g", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kook eieren 6,5 minuten in kokend water. Afkoelen in ijswater, schillen en marineren in sojasaus + water (1:1) voor minstens 30 min."},
            {"step": 2, "text": "Bak varkensbuik in een pan goudbruin. Blus met sojasaus. Zet apart."},
            {"step": 3, "text": "Verhit bouillon met gember en knoflook. Klop miso erdoor (niet meer koken na toevoeging miso)."},
            {"step": 4, "text": "Voeg sojasaus en sesamolie toe. Proef en breng op smaak."},
            {"step": 5, "text": "Blancheer paksoi 1 minuut in de bouillon. Kook noodles apart en verdeel over kommen."},
            {"step": 6, "text": "Schep bouillon over de noodles. Leg varkensbuik, ei (doormidden gesneden), paksoi, nori en lente-ui erop."},
        ],
    },

    {
        "name": "Rode linzensoep",
        "description": "Turkse rode linzensoep met komijn, kurkuma en een lik citroen. Voedzaam, plantaardig en snel klaar.",
        "prep_time": 10, "cook_time": 30, "total_time": 40,
        "servings": 4, "kcal": 280, "protein": 16.0, "carbs": 44.0, "fat": 6.0, "fiber": 12.0,
        "category": "soup", "cuisine": "Turks", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "rode linzen", "amount": 250, "unit": "g", "cat": "Voorraad"},
            {"name": "uien", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "gepelde tomaten (blik)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "groentenbouillon", "amount": 1000, "unit": "ml", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 2, "unit": "tl", "cat": "Voorraad"},
            {"name": "kurkuma", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "paprikapoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Stoof ui, wortels en knoflook in olijfolie 5 minuten."},
            {"step": 2, "text": "Voeg komijn, kurkuma en paprika toe. Bak 1 minuut mee."},
            {"step": 3, "text": "Spoel linzen en voeg toe samen met tomaten en bouillon. Breng aan de kook."},
            {"step": 4, "text": "Laat 25 minuten sudderen tot linzen volledig gaar zijn."},
            {"step": 5, "text": "Mix de soep glad met een staafmixer. Voeg citroenap toe en breng op smaak."},
            {"step": 6, "text": "Serveer met verse koriander en een scheutje olijfolie. Lekker met vers brood."},
        ],
    },

    {
        "name": "Thaise groene curry met kip",
        "description": "Aromatische Thaise curry met kip, kokosmelk, sperziebonen en Thaise basilicum.",
        "prep_time": 15, "cook_time": 20, "total_time": 35,
        "servings": 4, "kcal": 420, "protein": 34.0, "carbs": 14.0, "fat": 26.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Thais", "difficulty": "medium",
        "tags": ["vlees"], "is_healthy": False,
        "ingredients": [
            {"name": "kippenfilet (in reepjes)", "amount": 600, "unit": "g", "cat": "Vlees"},
            {"name": "kokosmelk (vol)", "amount": 400, "unit": "ml", "cat": "Voorraad"},
            {"name": "groene currypasta", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "bamboe (uit blik, uitgelekt)", "amount": 200, "unit": "g", "cat": "Voorraad"},
            {"name": "sperziebonen", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "rode paprika", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "kaffir limoenblaadjes", "amount": 4, "unit": "stuk", "cat": "Voorraad"},
            {"name": "vissaus", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "palmsuiker of bruine suiker", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "Thaise basilicum", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Verhit olie in een wok. Bak currypasta 1-2 minuten tot geurig."},
            {"step": 2, "text": "Voeg de helft van de kokosmelk toe en roer glad. Voeg limoenblaadjes toe."},
            {"step": 3, "text": "Voeg kipstukken toe en bak 5 minuten."},
            {"step": 4, "text": "Giet de rest van de kokosmelk erbij. Voeg bamboescheuten, paprika en sperziebonen toe."},
            {"step": 5, "text": "Laat 10 minuten sudderen. Breng op smaak met vissaus en suiker."},
            {"step": 6, "text": "Roer Thaise basilicum erdoor. Serveer met gestoomde jasmijnrijst."},
        ],
    },

    # ══════════════════════════════════
    # GEZONDE RECEPTEN (23-30)
    # ══════════════════════════════════

    {
        "name": "Zalm met gremolata en groene asperges",
        "description": "Gebakken zalmfilet met een frisse gremolata van citroen, knoflook en peterselie op een bedje van asperges.",
        "prep_time": 15, "cook_time": 15, "total_time": 30,
        "servings": 4, "kcal": 380, "protein": 36.0, "carbs": 6.0, "fat": 22.0, "fiber": 3.0,
        "category": "dinner", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "zalmfilets", "amount": 4, "unit": "stuk (à 150 g)", "cat": "Vlees"},
            {"name": "groene asperges", "amount": 500, "unit": "g", "cat": "Groenten"},
            {"name": "citroen (zest + sap)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse peterselie (fijngehakt)", "amount": 4, "unit": "el", "cat": "Groenten"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Maak de gremolata: meng citroenzest, geperste knoflook, peterselie en 1 el olijfolie. Kruid met zout en peper."},
            {"step": 2, "text": "Breek de houtige uiteinden van de asperges af. Verhit 1 el olijfolie in een grillpan."},
            {"step": 3, "text": "Gril de asperges 4-5 minuten tot beetgaar. Druppel citroenap erover. Zet warm."},
            {"step": 4, "text": "Kruid de zalmfilets met zout en peper. Bak op het vel in 1 el olijfolie, 4 minuten per kant."},
            {"step": 5, "text": "Leg zalm op de asperges en verdeel de gremolata erover."},
        ],
    },

    {
        "name": "Quinoasalade met geroosterde groenten",
        "description": "Voedzame quinoasalade met geroosterde courgette, paprika en zoete aardappel, afgewerkt met feta en citroenvinaigrette.",
        "prep_time": 20, "cook_time": 25, "total_time": 45,
        "servings": 4, "kcal": 480, "protein": 18.0, "carbs": 62.0, "fat": 16.0, "fiber": 8.0,
        "category": "salad", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "quinoa", "amount": 300, "unit": "g", "cat": "Voorraad"},
            {"name": "courgette", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "rode paprika", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "zoete aardappel", "amount": 300, "unit": "g", "cat": "Groenten"},
            {"name": "feta", "amount": 100, "unit": "g", "cat": "Kaas"},
            {"name": "rucola", "amount": 80, "unit": "g", "cat": "Groenten"},
            {"name": "olijfolie", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm oven op 200 °C. Snijd courgette, paprika en zoete aardappel in stukken. Besprenkel met olijfolie en komijn. Rooster 25 minuten."},
            {"step": 2, "text": "Kook quinoa in dubbele hoeveelheid water (1:2) 12 minuten. Laat 5 min stomen onder deksel, dan losroeren en afkoelen."},
            {"step": 3, "text": "Maak vinaigrette van citroenap, 2 el olijfolie, zout en peper."},
            {"step": 4, "text": "Meng quinoa, geroosterde groenten en rucola. Besprenkel met vinaigrette."},
            {"step": 5, "text": "Verdeel over borden en verkruimel feta erover."},
        ],
    },

    {
        "name": "Thaise kipsalade",
        "description": "Frisse salade met gekookte kip, glasnoedels, knapperige groenten en een pittige Thaise dressing.",
        "prep_time": 25, "cook_time": 15, "total_time": 40,
        "servings": 4, "kcal": 320, "protein": 28.0, "carbs": 32.0, "fat": 6.0, "fiber": 3.0,
        "category": "salad", "cuisine": "Thais", "difficulty": "easy",
        "tags": ["vlees"], "is_healthy": True,
        "ingredients": [
            {"name": "kippenborst", "amount": 400, "unit": "g", "cat": "Vlees"},
            {"name": "glasnoedels (mungboonnoodles)", "amount": 80, "unit": "g", "cat": "Brood"},
            {"name": "rodekool (fijngesneden)", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "wortels (geraspt)", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "lente-uitjes", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "verse koriander", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "verse munt", "amount": 1, "unit": "bosje", "cat": "Groenten"},
            {"name": "vissaus", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "limoensap", "amount": 3, "unit": "el", "cat": "Fruit"},
            {"name": "sesamolie", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "suiker", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "rode chili", "amount": 1, "unit": "stuk", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kook kip in licht gezouten water 12 minuten. Laat afkoelen en trek in draden."},
            {"step": 2, "text": "Week glasnoedels 10 minuten in heet water. Spoel af en knip in kortere stukken."},
            {"step": 3, "text": "Maak dressing: meng vissaus, limoensap, sesamolie, suiker en fijngesneden chili."},
            {"step": 4, "text": "Meng kip, noedels, rodekool, wortels en lente-uitjes in een grote kom."},
            {"step": 5, "text": "Besprenkel met dressing, schep om. Garneer met koriander en munt."},
        ],
    },

    {
        "name": "Buddha bowl met bruine rijst",
        "description": "Kleurrijke bowl met bruine rijst, kikkererwten, edamame, avocado en een romige tahini-dressing.",
        "prep_time": 20, "cook_time": 35, "total_time": 55,
        "servings": 4, "kcal": 520, "protein": 18.0, "carbs": 72.0, "fat": 18.0, "fiber": 10.0,
        "category": "dinner", "cuisine": "Gezond", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "bruine rijst", "amount": 300, "unit": "g", "cat": "Voorraad"},
            {"name": "kikkererwten (uit blik, uitgelekt)", "amount": 400, "unit": "g", "cat": "Voorraad"},
            {"name": "edamame (bevroren, gepeld)", "amount": 200, "unit": "g", "cat": "Diepvries"},
            {"name": "wortels", "amount": 2, "unit": "stuk", "cat": "Groenten"},
            {"name": "avocado's", "amount": 2, "unit": "stuk", "cat": "Fruit"},
            {"name": "rodekool (fijngesneden)", "amount": 150, "unit": "g", "cat": "Groenten"},
            {"name": "tahini", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "sojasaus", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "sesamolie", "amount": 1, "unit": "el", "cat": "Voorraad"},
            {"name": "limoen (sap)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "knoflook", "amount": 1, "unit": "teentje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Kook bruine rijst volgens de verpakking (±35 min). Laat 5 min stomen."},
            {"step": 2, "text": "Rooster kikkererwten in de oven op 200 °C met olie, zout en paprika 20 minuten tot knapperig (optioneel)."},
            {"step": 3, "text": "Kook edamame 3 minuten. Snijd wortels in julienne. Halveer avocado en snijd in schijfjes."},
            {"step": 4, "text": "Maak dressing: klop tahini, sojasaus, sesamolie, limoensap, geperste knoflook en 3 el water samen."},
            {"step": 5, "text": "Verdeel rijst in kommen. Rangschik alle groenten en kikkererwten erop. Druppel de tahini-dressing erover."},
        ],
    },

    {
        "name": "Geroosterde bloemkool met tahini",
        "description": "Hele geroosterde bloemkool met kruiden, overgoten met een romige tahini-saus en granaatappelpitjes.",
        "prep_time": 15, "cook_time": 35, "total_time": 50,
        "servings": 4, "kcal": 290, "protein": 10.0, "carbs": 26.0, "fat": 18.0, "fiber": 6.0,
        "category": "dinner", "cuisine": "Midden-Oosten", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "bloemkool", "amount": 1000, "unit": "g (1 grote)", "cat": "Groenten"},
            {"name": "olijfolie", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "gerookt paprikapoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "tahini", "amount": 4, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "knoflook", "amount": 1, "unit": "teentje", "cat": "Groenten"},
            {"name": "granaatappelpitjes", "amount": 50, "unit": "g", "cat": "Fruit"},
            {"name": "verse peterselie", "amount": 2, "unit": "el", "cat": "Groenten"},
            {"name": "pijnboompitten", "amount": 30, "unit": "g", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Verwarm oven op 200 °C. Snijd bloemkool in roosjes. Meng met olijfolie, komijn, paprika, zout en peper."},
            {"step": 2, "text": "Spreid op bakplaat. Rooster 30-35 minuten tot goudbruin en knapperig aan de randjes."},
            {"step": 3, "text": "Maak tahini-saus: klop tahini, citroenap, geperste knoflook en 4 el warm water glad."},
            {"step": 4, "text": "Rooster pijnboompitten in een droge pan goudbruin."},
            {"step": 5, "text": "Leg bloemkool op een schaal. Druppel tahini-saus erover. Bestrooi met granaatappelpitjes, peterselie en pijnboompitten."},
        ],
    },

    {
        "name": "Spinaziesoep met kokos",
        "description": "Fluweelzachte soep van verse spinazie, kokosmelk en gember. Plantaardig en vol smaak.",
        "prep_time": 10, "cook_time": 20, "total_time": 30,
        "servings": 4, "kcal": 220, "protein": 6.0, "carbs": 12.0, "fat": 16.0, "fiber": 3.0,
        "category": "soup", "cuisine": "Gezond", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "verse spinazie", "amount": 400, "unit": "g", "cat": "Groenten"},
            {"name": "kokosmelk (vol)", "amount": 400, "unit": "ml", "cat": "Voorraad"},
            {"name": "groentenbouillon", "amount": 800, "unit": "ml", "cat": "Voorraad"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 3, "unit": "teentjes", "cat": "Groenten"},
            {"name": "verse gember", "amount": 20, "unit": "g", "cat": "Groenten"},
            {"name": "komijnpoeder", "amount": 1, "unit": "tl", "cat": "Voorraad"},
            {"name": "kurkuma", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "rijstolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
        ],
        "instructions": [
            {"step": 1, "text": "Stoof ui, knoflook en gember in olie 3 minuten. Voeg komijn en kurkuma toe, bak 1 minuut."},
            {"step": 2, "text": "Voeg bouillon en kokosmelk toe. Breng aan de kook."},
            {"step": 3, "text": "Voeg spinazie toe in porties. Laat 2-3 minuten slinken."},
            {"step": 4, "text": "Mix alles glad met een staafmixer. Breng op smaak met citroenap, zout en peper."},
            {"step": 5, "text": "Serveer met een scheutje kokosmelk en een stukje brood of naan."},
        ],
    },

    {
        "name": "Courgetti met garnalen en kerstomaatjes",
        "description": "Lichte pasta-vervanging van courgetteslierten met roerbakgarnalen, kerstomaatjes en verse basilicum.",
        "prep_time": 20, "cook_time": 10, "total_time": 30,
        "servings": 4, "kcal": 220, "protein": 22.0, "carbs": 12.0, "fat": 8.0, "fiber": 4.0,
        "category": "dinner", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vis"], "is_healthy": True,
        "ingredients": [
            {"name": "courgettes (gespiralaiseerd)", "amount": 4, "unit": "stuk", "cat": "Groenten"},
            {"name": "rauwe garnalen (gepeld)", "amount": 300, "unit": "g", "cat": "Vlees"},
            {"name": "kerstomaatjes (gehalveerd)", "amount": 300, "unit": "g", "cat": "Groenten"},
            {"name": "knoflook", "amount": 4, "unit": "teentjes", "cat": "Groenten"},
            {"name": "chilivlokken", "amount": 0.5, "unit": "tl", "cat": "Voorraad"},
            {"name": "olijfolie", "amount": 3, "unit": "el", "cat": "Voorraad"},
            {"name": "citroen (sap + zest)", "amount": 1, "unit": "stuk", "cat": "Fruit"},
            {"name": "verse basilicum", "amount": 1, "unit": "bosje", "cat": "Groenten"},
        ],
        "instructions": [
            {"step": 1, "text": "Spiraliseer de courgettes of snijd met dunschiller in linten. Dep licht droog met keukenpapier."},
            {"step": 2, "text": "Verhit olijfolie in een grote pan. Bak knoflook en chilivlokken 30 seconden."},
            {"step": 3, "text": "Voeg garnalen toe en bak 2 minuten per kant tot roze. Haal apart."},
            {"step": 4, "text": "Voeg kerstomaatjes toe en bak 3 minuten tot ze beginnen te springen."},
            {"step": 5, "text": "Voeg courgetti toe en roer 1-2 minuten (niet te lang — anders waterig). Voeg garnalen terug toe."},
            {"step": 6, "text": "Breng op smaak met citroenap, zout en peper. Garneer met basilicum en citroenzest."},
        ],
    },

    {
        "name": "Omelet met spinazie en feta",
        "description": "Luchtige omelet gevuld met gestoofde spinazie en verkruimelde feta. Snel, eiwitrijk en veelzijdig.",
        "prep_time": 10, "cook_time": 15, "total_time": 25,
        "servings": 4, "kcal": 280, "protein": 20.0, "carbs": 4.0, "fat": 20.0, "fiber": 2.0,
        "category": "breakfast", "cuisine": "Mediterraan", "difficulty": "easy",
        "tags": ["vegetarisch"], "is_healthy": True,
        "ingredients": [
            {"name": "eieren", "amount": 8, "unit": "stuk", "cat": "Zuivel"},
            {"name": "verse spinazie", "amount": 200, "unit": "g", "cat": "Groenten"},
            {"name": "feta", "amount": 150, "unit": "g", "cat": "Kaas"},
            {"name": "ui", "amount": 1, "unit": "stuk", "cat": "Groenten"},
            {"name": "knoflook", "amount": 2, "unit": "teentjes", "cat": "Groenten"},
            {"name": "olijfolie", "amount": 2, "unit": "el", "cat": "Voorraad"},
        ],
        "instructions": [
            {"step": 1, "text": "Stoof ui en knoflook in olijfolie 3 minuten. Voeg spinazie toe en laat slinken (2 min). Breng op smaak."},
            {"step": 2, "text": "Kluts eieren met zout en peper."},
            {"step": 3, "text": "Verhit een beetje olie in een koekenpan op middelhoog vuur. Giet kwart van het eimengsel in de pan."},
            {"step": 4, "text": "Zodra de randen stollen, schep een kwart van de spinazie en feta op de helft van de omelet."},
            {"step": 5, "text": "Vouw de omelet dubbel. Laat nog 1 minuut rusten. Herhaal voor de andere 3 omelets."},
            {"step": 6, "text": "Serveer direct met volkorenbrood of een groene salade."},
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
