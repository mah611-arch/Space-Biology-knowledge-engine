# test_supabase.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os

print(">>> running test_supabase.py <<<")

# Load .env early
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"SUPABASE_URL={SUPABASE_URL}")
print(f"SUPABASE_KEY={SUPABASE_KEY[:5]}...")  # hide key

# Initialize Supabase client after loading env
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print(">>> querying supabase <<<")

try:
    data = supabase.table("publications").select("*").limit(1).execute()
    print(data.data)
except Exception as e:
    print("Error:", e)
