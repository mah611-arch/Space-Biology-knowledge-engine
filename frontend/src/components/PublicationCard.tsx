import React from "react";

type Props = {
  title: string;
  link: string;
  keywords: string[]; // array of normalized keywords
};

export default function PublicationCard({ title, link, keywords }: Props) {
  const hasLink = typeof link === "string" && link.trim().length > 0;
  return (
    <div className="bg-gradient-to-br from-purple-900/60 to-black/50 p-5 rounded-2xl shadow-lg border border-purple-800/40 hover:scale-[1.01] transition-transform">
      <h2 className="text-lg font-semibold mb-2 text-white">{title}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {keywords.length > 0 ? (
          keywords.map((k) => (
            <span key={k} className="text-xs px-2 py-1 rounded-full bg-purple-800/60 text-purple-100">
              {k}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400">No keywords</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300">
          {hasLink ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-200"
              onClick={(e) => {
                // ensure the link opens in a new tab and doesn't get swallowed by parent events
                // no extra logic needed, but we stop propagation just in case parent had click handlers
                e.stopPropagation();
              }}
            >
              Read more →
            </a>
          ) : (
            <span className="text-gray-500">No link available</span>
          )}
        </div>

        {hasLink && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 rounded-full bg-purple-600/80 hover:bg-purple-500 text-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            Open
          </a>
        )}
      </div>
    </div>
  );
}