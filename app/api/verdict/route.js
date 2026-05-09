import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory cache: gameId → verdict string
const verdictCache = new Map();

const PROMPT_TEMPLATE = `You are a tired NBA writer at 1am writing a one-paragraph "verdict" on whether a game was worth staying up for. Your voice is dry, slightly funny, never breathless. You don't say "thrilling" or "epic" — those are words for press releases. You name specific things: the score, the lead changes, who went off, who fouled out, who missed at the buzzer. End with a one-sentence verdict: "Yes, you should have stayed up." or "No, go to bed earlier next time." or some variation in the same voice. Don't be cute. Be honest.

Here's the game data: {{game_json}}

Worth-It Score (computed from the data): {{score}}/100

Write the verdict.`;

export async function POST(request) {
  try {
    const { game, score } = await request.json();
    const gameId = String(game.id);

    // Return cached verdict if available
    if (verdictCache.has(gameId)) {
      return Response.json({ verdict: verdictCache.get(gameId) });
    }

    const prompt = PROMPT_TEMPLATE
      .replace("{{game_json}}", JSON.stringify(game, null, 2))
      .replace("{{score}}", score);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const verdict = message.content[0].text;
    verdictCache.set(gameId, verdict);

    return Response.json({ verdict });
  } catch (error) {
    console.error("Verdict API error:", error);
    return Response.json({ error: "Failed to generate verdict" }, { status: 500 });
  }
}