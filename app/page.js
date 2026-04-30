"use client";

import { useState } from "react";
import Link from "next/link";
import { DM_Mono, Bebas_Neue } from "next/font/google";
import { computeWorthItScore, getVerdict } from "@/app/lib/worthItScore";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"] });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

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
        `https://api.balldontlie.io/nba/v1/games?dates[]=${selectedDate}&per_page=100`,
        { headers: { Authorization: process.env.NEXT_PUBLIC_BALLDONTLIE_API_KEY } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGames(data.data);
    } catch {
      setError("Couldn't load games.");
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    const val = e.target.value;
    setDate(val);
    fetchGames(val);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main
      className={dmMono.className}
      style={{ minHeight: "100vh", background: "#080808", color: "#f0ede8" }}
    >
      {/* Scanline texture */}
      <div style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Header */}
        <header style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#e85a1a", textTransform: "uppercase", marginBottom: 16 }}>
            NBA · {new Date().getFullYear()} Season
          </p>
          <h1
            className={bebasNeue.className}
            style={{ fontSize: "clamp(72px, 14vw, 108px)", lineHeight: 0.9, letterSpacing: "0.02em", color: "#f0ede8", marginBottom: 24 }}
          >
            Worth-It<br />
            <span style={{ color: "#e85a1a" }}>Score</span>
          </h1>
          <p style={{ fontSize: 12, color: "#5a5a5a", lineHeight: 1.8, maxWidth: 260 }}>
            Pick a date. Every game.<br />Find out if it deserved your time.
          </p>
        </header>

        {/* Date input */}
        <div style={{ marginBottom: 56 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#5a5a5a", marginBottom: 10 }}>
            Select Date
          </label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={handleDateChange}
            style={{
              background: "#111111",
              border: "1px solid #1e1e1e",
              color: "#f0ede8",
              padding: "12px 16px",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              colorScheme: "dark",
              cursor: "pointer",
            }}
            onFocus={e => e.target.style.borderColor = "#e85a1a"}
            onBlur={e => e.target.style.borderColor = "#1e1e1e"}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#5a5a5a", fontSize: 12, padding: "32px 0" }}>
            <span style={{
              display: "inline-block", width: 14, height: 14,
              border: "1px solid #e85a1a", borderTopColor: "transparent",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
            Fetching games…
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ border: "1px solid #7a2e0a", background: "rgba(122,46,10,0.15)", padding: "12px 16px", fontSize: 12, color: "#e85a1a", marginBottom: 32 }}>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && searched && games.length === 0 && !error && (
          <p style={{ color: "#5a5a5a", fontSize: 12, padding: "32px 0" }}>No games on this date.</p>
        )}

        {/* Games */}
        {!loading && games.length > 0 && (
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2e2e2e", marginBottom: 20 }}>
              {games.length} game{games.length !== 1 ? "s" : ""}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {games.map((game) => {
                const h = game.home_team_score;
                const v = game.visitor_team_score;
                const hasScore = h > 0 || v > 0;
                const homeWon = hasScore && h > v;
                const visitorWon = hasScore && v > h;
                const worthIt = computeWorthItScore(game);
                const verdict = getVerdict(worthIt);

                return (
                  <Link key={game.id} href={`/games/${game.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{ background: "#111111", border: "1px solid #1e1e1e", padding: "20px 24px", cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#2e2e2e"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}
                    >
                      {/* Teams + Score row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

                        {/* Visitor */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: visitorWon ? "#e85a1a" : "#2e2e2e", marginBottom: 4 }}>
                            {game.visitor_team.abbreviation}
                          </p>
                          <p style={{ fontSize: 13, color: visitorWon ? "#f0ede8" : "#5a5a5a", fontWeight: visitorWon ? 500 : 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {game.visitor_team.full_name}
                          </p>
                        </div>

                        {/* Score */}
                        <div style={{ flexShrink: 0, textAlign: "center", minWidth: 90 }}>
                          {hasScore ? (
                            <>
                              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
                                <span className={bebasNeue.className} style={{ fontSize: 32, color: visitorWon ? "#f0ede8" : "#2e2e2e", lineHeight: 1 }}>{v}</span>
                                <span style={{ fontSize: 11, color: "#1e1e1e" }}>–</span>
                                <span className={bebasNeue.className} style={{ fontSize: 32, color: homeWon ? "#f0ede8" : "#2e2e2e", lineHeight: 1 }}>{h}</span>
                              </div>
                              <p style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2e2e2e", marginTop: 2 }}>Final</p>
                            </>
                          ) : (
                            <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2e2e2e", textTransform: "uppercase" }}>vs</span>
                          )}
                        </div>

                        {/* Home */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                          <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: homeWon ? "#e85a1a" : "#2e2e2e", marginBottom: 4 }}>
                            {game.home_team.abbreviation}
                          </p>
                          <p style={{ fontSize: 13, color: homeWon ? "#f0ede8" : "#5a5a5a", fontWeight: homeWon ? 500 : 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {game.home_team.full_name}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row — status + verdict + details */}
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #161616", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2e2e2e" }}>
                          {game.status === "Final" ? "✓ Final" : game.status || "Scheduled"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {worthIt !== null && (
                            <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: verdict.color, fontWeight: 500 }}>
                              {verdict.label} · {worthIt}
                            </span>
                          )}
                          <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2e2e2e" }}>Details →</span>
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 96, paddingTop: 24, borderTop: "1px solid #111111" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#1e1e1e" }}>BallDontLie API</p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
      `}</style>
    </main>
  );
}