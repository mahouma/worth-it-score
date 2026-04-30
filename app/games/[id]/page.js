import Link from "next/link";
import { DM_Mono, Bebas_Neue } from "next/font/google";
import { computeWorthItScore, getScoreStyle } from "@/app/lib/worthItScore";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"] });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

async function getGame(id) {
  const res = await fetch(
    `https://api.balldontlie.io/nba/v1/games/${id}`,
    {
      headers: { Authorization: process.env.NEXT_PUBLIC_BALLDONTLIE_API_KEY },
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

function getPeriodLabel(period) {
  if (!period || period === 0) return null;
  if (period <= 4) return { label: `${period} ${period === 1 ? "Period" : "Periods"}`, ot: false };
  const ot = period - 4;
  return { label: ot === 1 ? "Overtime" : `${ot}× Overtime`, ot: true };
}

export default async function GamePage({ params }) {
  const game = await getGame(params.id);

  if (!game) {
    return (
      <main className={dmMono.className} style={{ minHeight: "100vh", background: "#080808", color: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#e85a1a", marginBottom: 16 }}>Not Found</p>
          <p style={{ fontSize: 12, color: "#5a5a5a", marginBottom: 32 }}>Game not found.</p>
          <Link href="/" style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5a5a5a", textDecoration: "none" }}>← Back</Link>
        </div>
      </main>
    );
  }

  const {
    home_team: home, visitor_team: visitor,
    home_team_score: hs, visitor_team_score: vs,
    period, status, date,
  } = game;

  const hasScore = hs > 0 || vs > 0;
  const homeWon = hasScore && hs > vs;
  const visitorWon = hasScore && vs > hs;
  const periodInfo = getPeriodLabel(period);
  const worthIt = computeWorthItScore(game);
  const { color: scoreColor, caption } = getScoreStyle(worthIt);

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <main className={dmMono.className} style={{ minHeight: "100vh", background: "#080808", color: "#f0ede8" }}>

      {/* Scanline */}
      <div style={{
        pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#5a5a5a", textDecoration: "none", marginBottom: 64 }}>
          ← Back to games
        </Link>

        {/* Date */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#e85a1a", marginBottom: 8 }}>
            NBA · Game Detail
          </p>
          {formattedDate && (
            <p style={{ fontSize: 12, color: "#5a5a5a" }}>{formattedDate}</p>
          )}
        </div>

        {/* Worth-It Score — hero block */}
        {worthIt !== null && (
          <div style={{
            background: "#111111", border: "1px solid #1e1e1e",
            padding: "32px 32px 28px", marginBottom: 2,
            display: "flex", alignItems: "center", gap: 28,
          }}>
            {/* Big number */}
            <span
              className={bebasNeue.className}
              style={{
                fontSize: 120,
                lineHeight: 1,
                color: scoreColor,
                letterSpacing: "-0.01em",
                flexShrink: 0,
              }}
            >
              {worthIt}
            </span>

            {/* Caption + breakdown */}
            <div>
              <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2e2e2e", marginBottom: 6 }}>
                Worth-It Score
              </p>
              <p style={{
                fontSize: 28,
                fontWeight: 500,
                color: scoreColor,
                lineHeight: 1.1,
                marginBottom: 12,
              }}>
                {caption}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <ScoreLine label="Closeness" value={Math.abs(hs - vs) <= 5 ? "Tight" : Math.abs(hs - vs) <= 10 ? "Competitive" : Math.abs(hs - vs) <= 20 ? "One-sided" : "Blowout"} color={scoreColor} />
                <ScoreLine label="Overtime" value={period > 4 ? `Yes — ${period - 4} OT` : "No"} color={scoreColor} />
                <ScoreLine label="Total scoring" value={`${hs + vs} pts`} color={scoreColor} />
              </div>
            </div>
          </div>
        )}

        {/* Score card */}
        <div style={{ background: "#111111", border: "1px solid #1e1e1e", padding: "40px 32px", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 40 }}>

            {/* Visitor */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 6 }}>Away</p>
              <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: visitorWon ? "#e85a1a" : "#2a2a2a", marginBottom: 8 }}>
                {visitor.abbreviation}
              </p>
              <p style={{ fontSize: 14, color: visitorWon ? "#f0ede8" : "#5a5a5a", fontWeight: visitorWon ? 500 : 300, lineHeight: 1.3 }}>
                {visitor.full_name}
              </p>
              {hasScore && (
                <p className={bebasNeue.className} style={{ fontSize: 80, lineHeight: 1, color: visitorWon ? "#f0ede8" : "#2a2a2a", marginTop: 16 }}>
                  {vs}
                </p>
              )}
            </div>

            {/* Divider */}
            <div style={{ flexShrink: 0, paddingTop: 56, textAlign: "center" }}>
              <span style={{ fontSize: 20, color: "#1e1e1e", fontWeight: 300 }}>–</span>
            </div>

            {/* Home */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 6 }}>Home</p>
              <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: homeWon ? "#e85a1a" : "#2a2a2a", marginBottom: 8 }}>
                {home.abbreviation}
              </p>
              <p style={{ fontSize: 14, color: homeWon ? "#f0ede8" : "#5a5a5a", fontWeight: homeWon ? 500 : 300, lineHeight: 1.3 }}>
                {home.full_name}
              </p>
              {hasScore && (
                <p className={bebasNeue.className} style={{ fontSize: 80, lineHeight: 1, color: homeWon ? "#f0ede8" : "#2a2a2a", marginTop: 16 }}>
                  {hs}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div style={{ borderTop: "1px solid #161616", paddingTop: 24, display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 6 }}>Status</p>
              <p style={{ fontSize: 12, color: "#5a5a5a" }}>{status || "—"}</p>
            </div>
            {periodInfo && (
              <div>
                <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 6 }}>Duration</p>
                <p style={{ fontSize: 12, color: periodInfo.ot ? "#e85a1a" : "#5a5a5a" }}>{periodInfo.label}</p>
              </div>
            )}
            {hasScore && (
              <div>
                <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 6 }}>Winner</p>
                <p style={{ fontSize: 12, color: "#5a5a5a" }}>
                  {homeWon ? home.full_name : visitorWon ? visitor.full_name : "Tie"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Team info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[{ label: "Away", team: visitor }, { label: "Home", team: home }].map(({ label, team }) => (
            <div key={team.id} style={{ background: "#111111", border: "1px solid #1e1e1e", padding: "20px 24px" }}>
              <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: 12 }}>{label}</p>
              <p style={{ fontSize: 13, color: "#f0ede8", fontWeight: 500, marginBottom: 8 }}>{team.full_name}</p>
              <p style={{ fontSize: 10, color: "#5a5a5a", marginBottom: 2 }}>{team.conference} Conf.</p>
              <p style={{ fontSize: 10, color: "#2a2a2a" }}>{team.division} Div.</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 96, paddingTop: 24, borderTop: "1px solid #111111" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#1e1e1e" }}>BallDontLie API</p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
      `}</style>
    </main>
  );
}

function ScoreLine({ label, value, color }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2e2e2e", minWidth: 90 }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: "#5a5a5a" }}>{value}</span>
    </div>
  );
}