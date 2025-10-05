from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from hf_client import summarize, get_embedding
from neo4j_client import upsert_pub
from db import supabase
from neo4j import GraphDatabase
from dotenv import load_dotenv
from typing import List, Optional, Dict
from fastapi.staticfiles import StaticFiles
import os

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASS = os.getenv("NEO4J_PASS")

if not all([NEO4J_URI, NEO4J_USER, NEO4J_PASS]):
    raise EnvironmentError("Neo4j credentials are not fully set in .env")

# Neo4j driver
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASS)
)

app = FastAPI()

# -----------------------------
# Serve frontend (React build)
# -----------------------------
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend/build")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

# -----------------------------
# Health check
# -----------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}

# -----------------------------
# Pydantic model
# -----------------------------
class PublicationIn(BaseModel):
    title: str
    abstract: Optional[str] = ""
    doi: Optional[str] = None
    year: Optional[int] = None
    mission: Optional[str] = None
    repository: Optional[str] = None
    organisms: List[str] = []
    hazards: List[str] = []
    assays: List[str] = []
    outcomes: List[str] = []
    keywords: List[str] = []

# -----------------------------
# Test endpoints
# -----------------------------
@app.get("/api/")
def root():
    return {"message": "NASA Backend operational"}

@app.get("/api/test-supabase")
def test_supabase():
    try:
        data = supabase.table("publications").select("*").limit(1).execute()
        return {"data": data.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-neo4j")
def test_neo4j():
    try:
        with driver.session() as session:
            result = session.run("RETURN 'Hello from Neo4j!' AS msg")
            return {"data": result.single()["msg"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Summarize endpoint
# -----------------------------
@app.post("/api/summarize")
def summarize_endpoint(item: Dict[str, str]):
    text = item.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text field is required")
    try:
        summary_text = summarize(text)
        return {"summary": summary_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Ingest endpoint
# -----------------------------
@app.post("/api/ingest")
def ingest(pub: PublicationIn):
    try:
        emb_vector = get_embedding(pub.abstract or pub.title or "No abstract")
        data = supabase.table("publications").insert({
            "title": pub.title,
            "abstract": pub.abstract,
            "doi": pub.doi,
            "year": pub.year,
            "mission": pub.mission,
            "repository": pub.repository,
            "organisms": pub.organisms,
            "hazards": pub.hazards,
            "assays": pub.assays,
            "outcomes": pub.outcomes,
            "keywords": pub.keywords,
            "embedding": emb_vector
        }).execute()
        upsert_pub(pub.dict())
        return {"status": "success", "supabase_result": data.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Optional main runner
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
