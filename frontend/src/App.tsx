import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import PublicationCard from "./components/PublicationCard";

type RawRow = Record<string, any>;
type Publication = {
  id: string | number;
  title: string;
  keywords: string[];
  keywordsText: string;
  link: string;
};

function normalizeKeywords(raw: any, title?: string): string[] {
  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.map((k) => String(k).trim().toLowerCase()).filter(Boolean)));
  }

  if (typeof raw === "string" && raw.trim().length > 0) {
    const cleaned = raw.replace(/^\{/, "").replace(/\}$/, "");
    const parts = cleaned.split(/[,;|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    return Array.from(new Set(parts));
  }

  if (title) {
    const parts = title
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
      .filter((w) => w.length > 3);
    return Array.from(new Set(parts));
  }

  return [];
}

export default function App() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [search, setSearch] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("publications").select("id, title, keywords, link");

      if (error) {
        console.error("Error fetching publications:", error);
        setPublications([]);
        setLoading(false);
        return;
      }

      const processed: Publication[] = (data || []).map((r: RawRow) => {
        const id = r.id ?? Math.random().toString(36).slice(2, 9);
        const title = (r.title ?? "").toString();
        const link = (r.link ?? "").toString();
        const kws = normalizeKeywords(r.keywords, title);
        return {
          id,
          title,
          link,
          keywords: kws,
          keywordsText: kws.join(", "),
        };
      });

      setPublications(processed);
      setLoading(false);
    };

    fetchData();
  }, []);

  const allKeywords = useMemo(() => {
    const s = new Set<string>();
    for (const p of publications) {
      for (const k of p.keywords) s.add(k);
    }
    return Array.from(s).sort();
  }, [publications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publications.filter((p) => {
      const matchesSearch = q === "" || p.title.toLowerCase().includes(q) || p.keywordsText.includes(q);
      const matchesKeywords = selectedKeywords.length === 0 || selectedKeywords.every((kw) => p.keywords.includes(kw));
      return matchesSearch && matchesKeywords;
    });
  }, [search, publications, selectedKeywords]);

  const toggleKeyword = (kw: string) =>
    setSelectedKeywords((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-300 drop-shadow-lg">
         NASA Research Publications
      </h1>

      <div className="max-w-xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Search by title or keywords..."
          className="w-full p-3 rounded-lg shadow-md text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clear Filters button outside the slider */}
      {selectedKeywords.length > 0 && (
        <div className="max-w-4xl mx-auto mb-2">
          <button
            onClick={() => setSelectedKeywords([])}
            className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 shadow text-white font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Keyword slider */}
      <div
        ref={scrollRef}
        className="max-w-4xl mx-auto mb-6 flex overflow-x-auto gap-2 py-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900"
      >
        {allKeywords.map((kw) => {
          const active = selectedKeywords.includes(kw);
          return (
            <button
              key={kw}
              onClick={() => toggleKeyword(kw)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                active
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40"
                  : "bg-purple-800/30 text-purple-200 hover:bg-purple-700/50"
              }`}
            >
              {kw}
            </button>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-300">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No publications found.</div>
        ) : (
          filtered.map((pub) => (
            <PublicationCard
              key={pub.id}
              title={pub.title}
              link={pub.link}
              keywords={pub.keywords}
            />
          ))
        )}
      </div>
    </div>
  );
}
