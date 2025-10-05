interface PublicationCardProps {
  title: string;
  link: string;
  keywords: string[]; // <-- changed from string to string[]
}

export default function PublicationCard({ title, link, keywords }: PublicationCardProps) {
  return (
    <div className="bg-indigo-950/70 backdrop-blur-md border border-purple-700 rounded-2xl shadow-lg p-6 hover:shadow-purple-600/40 hover:scale-105 transition-all duration-300">
      {/* Title */}
      <h2 className="text-xl font-semibold text-purple-300 mb-3 drop-shadow-md">
        {title}
      </h2>

      {/* Keywords as boxes */}
      {keywords && keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="px-3 py-1 rounded-full bg-purple-600/50 text-white text-xs font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-purple-400 mb-4 italic">No keywords</p>
      )}

      {/* Link */}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium shadow-md hover:shadow-purple-500/50 hover:from-purple-500 hover:to-indigo-600 transition-all duration-300"
        >
          🌐 Read More
        </a>
      ) : (
        <span className="text-gray-400">No link available</span>
      )}
    </div>
  );
}
