# supabase_loader.py
import csv
import os
from supabase import create_client, Client

# Load Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_publications(csv_file="SB_publication_PMC.csv"):
    with open(csv_file, newline='', encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        print("CSV headers detected:", reader.fieldnames)
        for row in reader:
            # Only Title and Link are in your CSV
            data = {
                "title": row["Title"],
                "link": row["Link"]
            }
            supabase.table("publications").insert(data).execute()
    print("✅ Publications uploaded to Supabase!")

if __name__ == "__main__":
    load_publications()
