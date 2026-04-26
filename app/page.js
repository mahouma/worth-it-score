"use client";

import { useState } from "react";

export default function Home() {
  const [date, setDate] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function fetchGames(selectedDate) {
    if (!selectedDate) return;
    setLoading(true);
    setError("");
    setGames([]);
    setSearched(true);

    try {
      const res = await fetch(
        `https://www.balldontlie.io/api/v1/games?dates[]=${selectedDate}&per_page=100`
      );
      if (!res.ok) throw new Error("Failed to fetch games.");
      const data = await res.json();
      setGames(data.data);
    } catch (err) {
      setError("Couldn't load games. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    const val = e.target.value;
    setDate(val);
    fetchGames(val);
  }

  function getResult(game) {
    const { home_team_score: h, visitor_team_score: v } = game;
    if (!h && !v) return "scheduled";
    return h > v ? "home" : v > h ? "visitor" : "tie";
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.3em] text-orange-500 uppercase mb-3">
            NBA · Game Log
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
            WORTH
            <span className="text-orange-500">-IT</span>
            <br />
            SCORE
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Pick a date. See every game. Find out if it was worth watching.
          </p>
        </div>

        {/* Date Input */}
        <div className="mb-12">
          <label className="block text-[10px] tracking-[0.25em] text-zinc-500 uppercase mb-2">
            Select Date
          </label>
          <div className="relative inline-block">
            <input
              type="date"
              value={date}
              max={today}
              onChange={handleDateChange}
              className="
                bg-zinc-900 border border-zinc-700 text-white
                px-4 py-3 pr-4 rounded-none text-sm
                focus:outline-none focus:border-orange-500
                transition-colors duration-200
                cursor-pointer
                [color-scheme:dark]
              "
            />
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 transition-all duration-300 peer-focus:w-full" />
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center gap-3 text-zinc-400 text-sm py-8">
            <span className="inline-block w-4 h-4 border border-orange-500 border-t-transparent rounded-full animate-spin" />
            Fetching games…
          </div>
        )}

        {error && (
          <div className="border border-red-900 bg-red-950/40 px-4 py-3 text-red-400 text-sm mb-8">
            {error}
          </div>
        )}

        {!loading && searched && games.length === 0 && !error && (
          <div className="py-8 text-zinc-500 text-sm">
            No games found for this date.
          </div>
        )}

        {/* Game Cards */}
        {!loading && games.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase mb-4">
              {games.length} game{games.length !== 1 ? "s" : ""} found
            </p>

            {games.map((game) => {
              const result = getResult(game);
              const hasScore = result !== "scheduled";
              const homeWon = result === "home";
              const visitorWon = result === "visitor";

              return (
                <div
                  key={game.id}
                  className="
                    group border border-zinc-800 bg-zinc-900/60
                    hover:border-zinc-600 hover:bg-zinc-900
                    transition-all duration-200
                    px-5 py-4
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Visitor */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[10px] tracking-widest uppercase mb-1 ${
                          visitorWon ? "text-orange-500" : "text-zinc-500"
                        }`}
                      >
                        {game.visitor_team.abbreviation}
                      </p>
                      <p
                        className={`text-sm truncate ${
                          visitorWon ? "text-white font-semibold" : "text-zinc-400"
                        }`}
                      >
                        {game.visitor_team.full_name}
                      </p>
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 text-center min-w-[80px]">
                      {hasScore ? (
                        <div className="flex items-baseline justify-center gap-2">
                          <span
                            className={`text-xl font-black tabular-nums ${
                              visitorWon ? "text-orange-400" : "text-zinc-300"
                            }`}
                          >
                            {game.visitor_team_score}
                          </span>
                          <span className="text-zinc-700 text-xs">—</span>
                          <span
                            className={`text-xl font-black tabular-nums ${
                              homeWon ? "text-orange-400" : "text-zinc-300"
                            }`}
                          >
                            {game.home_team_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs tracking-widest text-zinc-600 uppercase">
                          vs
                        </span>
                      )}
                      {hasScore && (
                        <p className="text-[9px] tracking-widest text-zinc-600 uppercase mt-1">
                          final
                        </p>
                      )}
                    </div>

                    {/* Home */}
                    <div className="flex-1 min-w-0 text-right">
                      <p
                        className={`text-[10px] tracking-widest uppercase mb-1 ${
                          homeWon ? "text-orange-500" : "text-zinc-500"
                        }`}
                      >
                        {game.home_team.abbreviation}
                      </p>
                      <p
                        className={`text-sm truncate ${
                          homeWon ? "text-white font-semibold" : "text-zinc-400"
                        }`}
                      >
                        {game.home_team.full_name}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[9px] tracking-[0.2em] uppercase text-zinc-600">
                      {game.status === "Final"
                        ? "✓ Final"
                        : game.status || "Scheduled"}
                    </span>
                    {hasScore && (
                      <span className="text-[9px] tracking-[0.2em] uppercase text-zinc-600">
                        {game.period
                          ? `${game.period} ${game.period === 1 ? "period" : "periods"}`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-6 border-t border-zinc-900">
          <p className="text-[9px] tracking-widest text-zinc-700 uppercase">
            Data via BallDontLie API
          </p>
        </div>
      </div>
    </main>
  );
}