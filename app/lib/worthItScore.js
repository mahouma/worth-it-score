/**
 * computeWorthItScore(game)
 *
 * Takes a game object from the BallDontLie API and returns a Worth-It Score
 * from 0 to 100 representing how much the game was worth watching.
 *
 * Scoring is built from four independent components that are summed and clamped:
 *
 *   1. Closeness       — how tight was the final margin?          (0–40 pts)
 *   2. Overtime        — did it go past regulation?               (0–25 pts)
 *   3. High scoring    — was the game offensively alive?          (0–20 pts)
 *   4. Finish quality  — was the 4th quarter/OT where it mattered?(0–15 pts)
 *
 * Total is clamped to [0, 100].
 */

export function computeWorthItScore(game) {
  const {
    home_team_score: home,
    visitor_team_score: visitor,
    period,
    status,
  } = game;

  // Guard: game hasn't finished yet — no score to evaluate
  const isComplete = status === "Final" || (typeof status === "string" && status.toLowerCase().includes("final"));
  if (!isComplete || !home || !visitor) return null;

  let score = 0;

  // ─────────────────────────────────────────────
  // COMPONENT 1: Closeness (0–40 points)
  //
  // The margin of victory is the single strongest signal.
  // A 1-point game is an all-timer; a 40-point blowout is unwatchable.
  //
  //   margin  1–5   → 40 pts  (thriller)
  //   margin  6–10  → 30 pts  (competitive)
  //   margin 11–15  → 18 pts  (one team had the edge throughout)
  //   margin 16–20  → 8 pts   (noticeable gap)
  //   margin 21+    → 0 pts   (blowout)
  // ─────────────────────────────────────────────
  const margin = Math.abs(home - visitor);

  if (margin <= 5)       score += 40;
  else if (margin <= 10) score += 30;
  else if (margin <= 15) score += 18;
  else if (margin <= 20) score += 8;
  else                   score += 0;  // blowout, nothing added


  // ─────────────────────────────────────────────
  // COMPONENT 2: Overtime (0–25 points)
  //
  // Overtime means regulation couldn't settle it — pure drama.
  // Each additional OT period adds more, but with diminishing returns
  // (a 4OT game isn't necessarily 4x better than 1OT).
  //
  //   4 periods (regulation)  → 0 pts
  //   5 periods (1 OT)        → 15 pts
  //   6 periods (2 OT)        → 20 pts
  //   7+ periods (3+ OT)      → 25 pts
  // ─────────────────────────────────────────────
  const periods = period || 4; // default to 4 if missing

  if (periods === 5)      score += 15;
  else if (periods === 6) score += 20;
  else if (periods >= 7)  score += 25;
  // regulation (periods <= 4): nothing added


  // ─────────────────────────────────────────────
  // COMPONENT 3: High Scoring (0–20 points)
  //
  // Combined total points signal offensive pace and energy.
  // Low-scoring games can be defensive grinds — sometimes great,
  // but less universally entertaining.
  //
  //   total 230+  → 20 pts  (shootout)
  //   total 210+  → 14 pts  (up-tempo)
  //   total 190+  → 8 pts   (average pace)
  //   total <190  → 2 pts   (defensive game or slow pace)
  // ─────────────────────────────────────────────
  const total = home + visitor;

  if (total >= 230)      score += 20;
  else if (total >= 210) score += 14;
  else if (total >= 190) score += 8;
  else                   score += 2;


  // ─────────────────────────────────────────────
  // COMPONENT 4: Finish Quality (0–15 points)
  //
  // A close game that was close all along is different from a blowout
  // that got interesting in the last 2 minutes. We approximate finish
  // quality by combining margin tightness with whether it went to OT.
  //
  // If the game was close (margin ≤ 10) AND went to overtime → full bonus.
  // If the game was close but stayed in regulation → partial bonus.
  // If the game was a blowout regardless of period count → no bonus.
  // ─────────────────────────────────────────────
  if (margin <= 10 && periods > 4) {
    score += 15; // close game that needed extra time = elite finish
  } else if (margin <= 5) {
    score += 10; // razor-thin regulation finish
  } else if (margin <= 10) {
    score += 5;  // competitive finish, decided in regulation
  }
  // margin > 10: no finish bonus


  // ─────────────────────────────────────────────
  // CLAMP to [0, 100] and round to nearest integer
  // ─────────────────────────────────────────────
  return Math.min(100, Math.max(0, Math.round(score)));
}


// ─────────────────────────────────────────────
// VERDICT LABEL
//
// Maps a numeric score to a human-readable verdict.
// Use this on the UI alongside the number.
// ─────────────────────────────────────────────
export function getVerdict(score) {
  if (score === null)  return { label: "TBD",     color: "#5a5a5a" };
  if (score >= 85)     return { label: "CLASSIC",  color: "#e85a1a" };
  if (score >= 65)     return { label: "WATCH",    color: "#c0793a" };
  if (score >= 45)     return { label: "DECENT",   color: "#7a7a5a" };
  return               { label: "SKIP",    color: "#3a3a3a" };
}