# neo4j_client.py
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASS = os.getenv("NEO4J_PASS")
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

def upsert_publication(tx, pub):
    # pub: dict with id,title,organisms,hazards,assays,outcomes
    tx.run(
        """
        MERGE (p:Publication {id: $id})
        SET p.title = $title, p.doi = $doi, p.year = $year, p.mission = $mission, p.repository=$repository
        """,
        id=pub["id"], title=pub.get("title"), doi=pub.get("doi"), year=pub.get("year"),
        mission=pub.get("mission"), repository=pub.get("repository")
    )
    for o in pub.get("organisms", []):
        tx.run("MERGE (o:Organism {name:$name}) MERGE (p:Publication {id:$id}) MERGE (p)-[:STUDIES]->(o)", name=o, id=pub["id"])
    for h in pub.get("hazards", []):
        tx.run("MERGE (h:Hazard {name:$name}) MERGE (p:Publication {id:$id}) MERGE (p)-[:HAS_HAZARD]->(h)", name=h, id=pub["id"])
    for a in pub.get("assays", []):
        tx.run("MERGE (a:Assay {name:$name}) MERGE (p:Publication {id:$id}) MERGE (p)-[:USED_ASSAY]->(a)", name=a, id=pub["id"])

def upsert_pub(pub: dict):
    with driver.session() as session:
        session.write_transaction(upsert_publication, pub)
