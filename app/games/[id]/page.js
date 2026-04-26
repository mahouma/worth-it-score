import Link from "next/link";

async function getGame(id) {
  const res = await fetch(`https://www.balldontlie.io/api/v1/games/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

function getPeriodLabel(period) {
  if (!period || period === 0) return null;
  if (period <= 4) return `${period} ${period === 1 ? "Quarter" : "Quarters"}`;
  const otNumber = period - 4;
  return otNumber === 1 ? "Overtime" : `${otNumber}× Overtime`;
}

export default async function GamePage({ params }) {
  const game = await getGame(params.id);

  if (!game) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white font-mono flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-[10px] tracking-[0.3em] text-orange-500 uppercase mb-4">Error</p>
          <p className="text-zinc-400 text-sm mb-6">Game not found.</p>
          <Link href="/" className="text-[10px] tracking-widest uppercase text-zinc-500 hover:text-white transition-colors">
            ← Back
          </Link>
        </div>
      </main>
    );
  }

  const { home_team, visitor_team, home_team_score, visitor_team_score, period, status, date } = game;

  const hasScore = home_team_score > 0 || visitor_team_score > 0;
  const homeWon = hasScore && home_team_score > visitor_team_score;
  const visitorWon = hasScore && visitor_team_score > home_team_score;
  const periodLabel = getPeriodLabel(period);
  const wentToOT = period > 4;

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

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

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-zinc-500 hover:text-white transition-colors duration-200 mb-12"
        >
          ← Back to games
        </Link>

        {/* Top label */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.3em] text-orange-500 uppercase mb-2">
            NBA · Game Detail
          </p>
          {formattedDate && (
            <p className="text-zinc-500 text-sm">{formattedDate}</p>
          )}
        </div>

        {/* Score block */}
        <div className="border border-zinc-800 bg-zinc-900/60 px-6 py-10 mb-6">

          {/* Teams + Big Score */}
          <div className="flex items-center gap-6">

            {/* Visitor */}
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 ${visitorWon ? "text-orange-500" : "text-zinc-500"}`}>
                Away
              </p>
              <p className={`text-xs tracking-widest uppercase mb-1 ${visitorWon ? "text-zinc-300" : "text-zinc-500"}`}>
                {visitor_team.abbreviation}
              </p>
              <p className={`text-base leading-tight mb-4 ${visitorWon ? "text-white font-semibold" : "text-zinc-400"}`}>
                {visitor_team.full_name}
              </p>
              {hasScore && (
                <p className={`text-6xl font-black tabular-nums tracking-tight ${visitorWon ? "text-orange-400" : "text-zinc-400"}`}>
                  {visitor_team_score}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {hasScore ? (
                <span className="text-zinc-700 text-2xl font-thin">—</span>
              ) : (
                <span className="text-[10px] tracking-[0.2em] text-zinc-600 uppercase">vs</span>
              )}
            </div>

            {/* Home */}
            <div className="flex-1 min-w-0 text-right">
              <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 ${homeWon ? "text-orange-500" : "text-zinc-500"}`}>
                Home
              </p>
              <p className={`text-xs tracking-widest uppercase mb-1 ${homeWon ? "text-zinc-300" : "text-zinc-500"}`}>
                {home_team.abbreviation}
              </p>
              <p className={`text-base leading-tight mb-4 ${homeWon ? "text-white font-semibold" : "text-zinc-400"}`}>
                {home_team.full_name}
              </p>
              {hasScore && (
                <p className={`text-6xl font-black tabular-nums tracking-tight ${homeWon ? "text-orange-400" : "text-zinc-400"}`}>
                  {home_team_score}
                </p>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-1">Status</p>
              <p className="text-xs text-zinc-300">{status || "—"}</p>
            </div>

            {periodLabel && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-1">Duration</p>
                <p className={`text-xs ${wentToOT ? "text-orange-400" : "text-zinc-300"}`}>
                  {periodLabel}
                  {wentToOT && (
                    <span className="ml-2 text-[9px] tracking-widest uppercase text-orange-500/70">OT</span>
                  )}
                </p>
              </div>
            )}

            {hasScore && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-1">Winner</p>
                <p className="text-xs text-zinc-300">
                  {homeWon ? home_team.full_name : visitorWon ? visitor_team.full_name : "Tie"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conference / Division info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Away", team: visitor_team },
            { label: "Home", team: home_team },
          ].map(({ label, team }) => (
            <div key={team.id} className="border border-zinc-800 bg-zinc-900/40 px-4 py-4">
              <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600 mb-3">{label}</p>
              <p className="text-xs text-white font-semibold mb-2">{team.full_name}</p>
              <p className="text-[10px] text-zinc-500">{team.conference} Conference</p>
              <p className="text-[10px] text-zinc-600">{team.division} Division</p>
            </div>
          ))}
        </div>

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