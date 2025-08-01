'use client';

// A simple SVG of the Justice League logo to use as a loader
const JusticeLeagueLoader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-10 h-10 text-yellow-400 animate-pulse"
    fill="currentColor"
  >
    <path d="M12 2L2 7l10 15 10-15-10-5zM12 4.53L18.74 10l-6.74 10.11L5.26 10 12 4.53z" />
  </svg>
);


export default function HeroicLoader() {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-yellow-400/50 flex items-center justify-center bg-gray-800/50">
        <JusticeLeagueLoader />
      </div>
      <div className="max-w-lg p-4 rounded-xl shadow-md bg-gray-800">
        <p className="text-gray-400 italic">Contacting the Watchtower...</p>
        <p className="text-sm text-gray-500">A hero is on their way.</p>
      </div>
    </div>
  );
}
