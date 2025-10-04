# loader.py
import os
import csv
import time
import requests
from neo4j import GraphDatabase
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Load environment variables from .env ---
load_dotenv()

REQUIRED_ENV_VARS = ["SUPABASE_URL", "SUPABASE_KEY", "NEO4J_URI", "NEO4J_USER", "NEO4J_PASS"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"❌ Missing required environment variable: {var}")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASS = os.getenv("NEO4J_PASS")

# --- Initialize clients ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

CSV_FILE = "SB_publication_PMC.csv"

# --- Retry settings ---
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

def fetch_page_text(link: str) -> str:
    """Fetch plain text from a URL with retries. Returns empty string if fails."""
    headers = {"User-Agent": "Mozilla/5.0"}
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(link, headers=headers, timeout=10)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException:
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                return ""

def load_publications():
    with driver.session() as session:
        with open(CSV_FILE, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            print("CSV headers detected:", reader.fieldnames)
            for row in reader:
                title = row.get("Title")
                link = row.get("Link")
                if not title or not link:
                    continue

                # Fetch page text (optional, just for reference)
                content = fetch_page_text(link)

                # Supabase insert
                data = {
                    "title": title,
                    "link": link,
                    "summary": content[:1000]  # store first 1000 chars if you want
                }
                try:
                    supabase.table("publications").insert(data).execute()
                except Exception as e:
                    print(f"⚠️ Failed to upload to Supabase: {e}")

                # Neo4j insert
                try:
                    session.run(
                        "MERGE (p:Publication {title: $title}) "
                        "SET p.link = $link, p.summary = $summary",
                        title=title,
                        link=link,
                        summary=content[:1000]
                    )
                except Exception as e:
                    print(f"⚠️ Failed to upload to Neo4j: {e}")

                print(f"✅ Uploaded: {title}")

    print("🎉 All publications processed!")

if __name__ == "__main__":
    load_publications()
    driver.close()
