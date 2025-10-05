import React, { useEffect, useState } from "react";

type Publication = {
  title: string;
  abstract?: string;
  doi?: string;
  year?: number;
  mission?: string;
  repository?: string;
  organisms?: string[];
  hazards?: string[];
  assays?: string[];
  outcomes?: string[];
  keywords?: string[];
};

// ✅ Replace with your Render backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com";

export default function App() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/test-supabase`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setPublications(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading data from backend...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (publications.length === 0) return <div>No publications found.</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>NASA Space Biology Publications</h1>
      {publications.map((pub, index) => (
        <div key={index} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
          <h2>{pub.title}</h2>
          {pub.abstract && <p><strong>Abstract:</strong> {pub.abstract}</p>}
          {pub.doi && <p><strong>DOI:</strong> {pub.doi}</p>}
          {pub.year && <p><strong>Year:</strong> {pub.year}</p>}
          {pub.mission && <p><strong>Mission:</strong> {pub.mission}</p>}
          {pub.organisms?.length ? <p><strong>Organisms:</strong> {pub.organisms.join(", ")}</p> : null}
          {pub.keywords?.length ? <p><strong>Keywords:</strong> {pub.keywords.join(", ")}</p> : null}
        </div>
      ))}
    </div>
  );
}
