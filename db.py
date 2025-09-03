# db.py
import os
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Table creation is done in Supabase SQL editor
CREATE_PUBLICATIONS_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  abstract text,
  doi text,
  year integer,
  mission text,
  repository text,
  organisms text[],
  hazards text[],
  assays text[],
  outcomes text[],
  keywords text[],
  embedding vector(768)
);
CREATE INDEX IF NOT EXISTS idx_publications_embedding ON publications USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
"""
def init_schema():
    print("Run the CREATE_PUBLICATIONS_SQL in Supabase SQL editor once to setup table & vector extension.")
