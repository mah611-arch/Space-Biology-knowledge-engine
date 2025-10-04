# neo4j_loader.py
import os
import csv
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load .env variables automatically
load_dotenv()  # make sure you have python-dotenv installed

NEO4J_URI = os.getenv("NEO4J_URI")      # e.g., bolt://<your-neo4j-host>:7687
NEO4J_USER = os.getenv("NEO4J_USER")    # e.g., neo4j
NEO4J_PASS = os.getenv("NEO4J_PASS")    # your Aura password

# Ensure all variables are present
if not all([NEO4J_URI, NEO4J_USER, NEO4J_PASS]):
    raise ValueError("Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASS in your .env file")

# Connect to Neo4j
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

def load_publications(csv_file="SB_publication_PMC.csv"):
    """Load publications from CSV into Neo4j as Publication nodes"""
    with driver.session() as session:
        with open(csv_file, newline='', encoding="utf-8-sig") as f:  # handles BOM automatically
            reader = csv.DictReader(f)
            print("CSV headers detected:", reader.fieldnames)
            for row in reader:
                title = row.get("Title")
                link = row.get("Link")
                if not title:
                    continue  # skip rows without a title

                # Use MERGE instead of CREATE to avoid duplicates
                session.run(
                    """
                    MERGE (p:Publication {title: $title})
                    SET p.link = $link
                    """,
                    title=title,
                    link=link
                )
    print("✅ Publications uploaded to Neo4j!")

if __name__ == "__main__":
    load_publications()
    driver.close()
