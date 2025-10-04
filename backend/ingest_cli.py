# ingest_cli.py
import csv, asyncio, json
from backend.main import ingest, PubIn  # we will define ingest in main.py later

async def ingest_file(path):
    items = []
    if path.endswith(".csv"):
        with open(path, newline='', encoding='utf8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                items.append(row)
    else:
        with open(path, 'r', encoding='utf8') as f:
            items = json.load(f)
    for row in items:
        pub = PubIn(
            title=row.get("title") or row.get("Title"),
            abstract=row.get("abstract") or row.get("Abstract", ""),
            doi=row.get("doi"),
            year=int(row.get("year")) if row.get("year") else None,
            mission=row.get("mission"),
            repository=row.get("repository"),
            organisms=[o.strip() for o in (row.get("organisms") or "").split(";") if o.strip()],
            hazards=[h.strip() for h in (row.get("hazards") or "").split(";") if h.strip()],
            assays=[a.strip() for a in (row.get("assays") or "").split(";") if a.strip()],
            outcomes=[o.strip() for o in (row.get("outcomes") or "").split(";") if o.strip()],
            keywords=[k.strip() for k in (row.get("keywords") or "").split(";") if k.strip()],
        )
        await ingest(pub)
if __name__ == "__main__":
    import sys
    asyncio.run(ingest_file(sys.argv[1]))
