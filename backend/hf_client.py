# hf_client.py
import os, requests
from dotenv import load_dotenv
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_SUMMARY_MODEL = "facebook/bart-large-cnn"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def get_embedding(text: str):
    url = f"https://api-inference.huggingface.co/embeddings/{HF_EMBED_MODEL}"
    resp = requests.post(url, headers=HEADERS, json={"inputs": text})
    resp.raise_for_status()
    j = resp.json()
    if "embedding" in j:
        return j["embedding"]
    elif isinstance(j, list) and len(j) and "embedding" in j[0]:
        return j[0]["embedding"]
    raise RuntimeError("Unexpected embedding response")

def summarize(text: str, max_length=120):
    url = f"https://api-inference.huggingface.co/models/{HF_SUMMARY_MODEL}"
    payload = {"inputs": text, "parameters": {"max_length": max_length}}
    resp = requests.post(url, headers=HEADERS, json=payload)
    resp.raise_for_status()
    j = resp.json()
    if isinstance(j, list) and len(j) and "summary_text" in j[0]:
        return j[0]["summary_text"]
    return str(j)
