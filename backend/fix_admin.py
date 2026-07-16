import psycopg
from pathlib import Path

env = {}
for line in Path(".env").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

db_url = env["DATABASE_URL"].replace("postgresql+psycopg://", "postgresql://")

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE")
        cur.execute("UPDATE users SET is_admin = TRUE WHERE email = 'dietvandevelde@gmail.com'")
        cur.execute("SELECT email, is_admin FROM users")
        for row in cur.fetchall():
            print(row)
    conn.commit()
print("Klaar")
