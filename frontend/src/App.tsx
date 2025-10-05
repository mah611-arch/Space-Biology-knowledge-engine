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

  // Auto-scroll effect when many keywords exist
  useEffect(() => {
    const container = scrollRef.current;
    if (container && allKeywords.length > 0) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [allKeywords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white px-8 py-10">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-purple-300 drop-shadow-2xl tracking-wide">
         NASA Research Publications
      </h1>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search by title or keywords..."
          className="w-full p-4 rounded-xl shadow-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clear Filters button */}
      {selectedKeywords.length > 0 && (
        <div className="max-w-6xl mx-auto mb-4 text-center">
          <button
            onClick={() => setSelectedKeywords([])}
            className="px-5 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 shadow-lg shadow-red-500/40 font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Keyword Slider with edge fades */}
      <div className="relative max-w-6xl mx-auto mb-10">
        {/* fade left */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-indigo-950 to-transparent z-10" />
        {/* fade right */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-indigo-950 to-transparent z-10" />

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 py-3 px-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900"
        >
          {allKeywords.map((kw) => {
            const active = selectedKeywords.includes(kw);
            return (
              <button
                key={kw}
                onClick={() => toggleKeyword(kw)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40 scale-105"
                    : "bg-purple-800/30 text-purple-200 hover:bg-purple-700/50"
                }`}
              >
                {kw}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publication Cards */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-gray-300 animate-pulse">Loading…</div>
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
