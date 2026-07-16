#!/usr/bin/env python3
"""
Laadt recepten rechtstreeks in de database (omzeilt de API).
Leest DATABASE_URL uit .env
"""
import sys, json, uuid
from pathlib import Path

# Laad DATABASE_URL uit .env
env = {}
for line in Path(".env").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

db_url = env["DATABASE_URL"]
# psycopg wil postgresql://, niet postgresql+psycopg://
db_url = db_url.replace("postgresql+psycopg://", "postgresql://")

import psycopg

from seed_catalog import RECIPES as BATCH1
from seed_catalog_2 import RECIPES as BATCH2

ALL = BATCH1 + BATCH2
print(f"Totaal te importeren: {len(ALL)} recepten")

INSERT = """
INSERT INTO catalog_recipes
  (id, name, description, prep_time, cook_time, total_time, servings,
   kcal, protein, carbs, fat, fiber, category, cuisine, difficulty,
   tags, ingredients, instructions, source_url, is_healthy,
   created_at, updated_at)
VALUES
  (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
ON CONFLICT DO NOTHING
"""

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        ok = 0
        for r in ALL:
            cur.execute(INSERT, (
                str(uuid.uuid4()),
                r["name"],
                r.get("description"),
                r.get("prep_time"),
                r.get("cook_time"),
                r.get("total_time"),
                r.get("servings", 4),
                r.get("kcal"),
                r.get("protein"),
                r.get("carbs"),
                r.get("fat"),
                r.get("fiber"),
                r.get("category", "dinner"),
                r.get("cuisine"),
                r.get("difficulty", "medium"),
                json.dumps(r.get("tags", [])),
                json.dumps(r.get("ingredients", [])),
                json.dumps(r.get("instructions", [])),
                r.get("source_url"),
                r.get("is_healthy", False),
            ))
            print(f"  OK {r['name']}")
            ok += 1
        conn.commit()

print(f"\nKlaar! {ok} recepten toegevoegd.")
