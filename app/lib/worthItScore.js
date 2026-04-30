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
  const { home_team_score: home, visitor_team_score: visitor, period, status } = game;
 
  const isComplete =
    status === "Final" ||
    (typeof status === "string" && status.toLowerCase().includes("final"));
 
  if (!isComplete || !home || !visitor) return null;
 
  let score = 0;
 
  // Closeness (0–40)
  const margin = Math.abs(home - visitor);
  if (margin <= 5)       score += 40;
  else if (margin <= 10) score += 30;
  else if (margin <= 15) score += 18;
  else if (margin <= 20) score += 8;
 
  // Overtime (0–25)
  const periods = period || 4;
  if (periods === 5)     score += 15;
  else if (periods === 6) score += 20;
  else if (periods >= 7) score += 25;
 
  // High scoring (0–20)
  const total = home + visitor;
  if (total >= 230)      score += 20;
  else if (total >= 210) score += 14;
  else if (total >= 190) score += 8;
  else                   score += 2;
 
  // Finish quality (0–15)
  if (margin <= 10 && periods > 4) score += 15;
  else if (margin <= 5)            score += 10;
  else if (margin <= 10)           score += 5;
 
  return Math.min(100, Math.max(0, Math.round(score)));
}
 
/**
 * getScoreStyle(score)
 * Returns color and caption for a given Worth-It Score.
 *
 * Color shifts:
 *   0–30   → red    #e84040  "Skip it"
 *   30–60  → yellow #e8b840  "Mediocre"
 *   60–85  → green  #40c97a  "Worth it"
 *   85–100 → bright green #00f090  "Don't miss this"
 *
 * For smooth color interpolation between ranges, we blend hex values
 * based on position within each band.
 */
export function getScoreStyle(score) {
  if (score === null) {
    return { color: "#3a3a3a", caption: "TBD" };
  }
 
  if (score < 30) {
    // Deep red to red-orange
    const t = score / 30;
    return {
      color: interpolateColor("#c02020", "#e84040", t),
      caption: "Skip it",
    };
  }
 
  if (score < 60) {
    // Red-orange to yellow
    const t = (score - 30) / 30;
    return {
      color: interpolateColor("#e84040", "#e8b840", t),
      caption: "Mediocre",
    };
  }
 
  if (score < 85) {
    // Yellow to green
    const t = (score - 60) / 25;
    return {
      color: interpolateColor("#e8b840", "#40c97a", t),
      caption: "Worth it",
    };
  }
 
  // Green to bright green
  const t = (score - 85) / 15;
  return {
    color: interpolateColor("#40c97a", "#00f090", t),
    caption: "Don't miss this",
  };
}
 
/** Linearly interpolate between two hex colors */
function interpolateColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, "0");
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, "0");
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}