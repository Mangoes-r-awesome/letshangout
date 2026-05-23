// Claude API wrapper. Used for: nudge copywriting + parsing free-text SMS replies.

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function call(systemPrompt: string, userPrompt: string, maxTokens = 500): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY required");

  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[claude] error:", res.status, text);
    throw new Error(`Claude API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text;
  if (!text) throw new Error("No text in Claude response");
  return text;
}

/**
 * Generates a nudge message for someone who hasn't RSVP'd.
 * Tone escalates with their reply rate and how close the event is.
 * Note: caller appends the deep link separately, so leave the message under ~130 chars
 * to fit within 160-char SMS limit after the URL is added.
 */
export async function generateNudge(opts: {
  recipientName: string;
  hangoutTitle: string;
  daysUntil: number;
  recipientReplyRate: number;
  nudgeAttemptNumber: number;
}): Promise<string> {
  const toneLevel = Math.min(5, 1 + opts.nudgeAttemptNumber + (opts.recipientReplyRate < 50 ? 1 : 0) + (opts.daysUntil < 3 ? 1 : 0));

  const system = `You are a friendly Australian agent for an app called Hangouts. Your job is writing nudge SMS messages to friends who haven't RSVP'd to a group plan yet. Your voice: casual, Australian, mate-like, never corporate, never preachy, uses light cheek and minimal emojis. Always under 130 characters to leave room for a link.

Tone level ${toneLevel}/5:
- 1: gentle reminder, friendly
- 2: cheeky reminder
- 3: playful pressure with light cheek
- 4: spicy, calling out the flake behaviour
- 5: maximum spice, calling out their reply rate publicly visible in the squad

Never use the word "RSVP" — say "yes or no" or "you in or out". Never use exclamation marks. Never include a URL or link in the message — the system adds that automatically. Output only the message text.`;

  const user = `Generate a single SMS nudge to send to ${opts.recipientName} about: "${opts.hangoutTitle}". They have not yet responded. This is nudge attempt #${opts.nudgeAttemptNumber}. They reply ${opts.recipientReplyRate}% of the time. The event is ${opts.daysUntil} days away. Output ONLY the message text, nothing else, no quotes.`;

  const text = await call(system, user, 200);
  return text.trim().replace(/^["']|["']$/g, "");
}

export async function parseRsvpReply(opts: {
  hangoutTitle: string;
  replyText: string;
}): Promise<{ status: "in" | "maybe" | "out" | "unclear"; reason?: string }> {
  const system = `You parse free-text SMS replies into structured RSVP status. Output ONLY valid JSON, no markdown, no explanation.

Schema: {"status": "in" | "maybe" | "out" | "unclear", "reason": "short explanation"}

Australian colloquialisms map like this:
- "yeah", "yep", "im in", "down", "let's go", "keen", "for sure" → "in"
- "maybe", "ill try", "depends", "probably", "i think so", "see how i go" → "maybe"
- "nah", "cant", "cbf", "can't make it", "im out", "sorry", "another time" → "out"
- "what time?", "where again?", questions only, ambiguous → "unclear"`;

  const user = `Hangout: "${opts.hangoutTitle}"\nReply: "${opts.replyText}"`;

  const text = await call(system, user, 100);
  try {
    return JSON.parse(text);
  } catch {
    return { status: "unclear", reason: "Failed to parse Claude response" };
  }
}

export async function suggestActivities(opts: {
  squadName: string;
  pastHangouts: string[];
  location?: string;
  budget?: string;
}): Promise<Array<{ name: string; emoji: string; reason: string; match: number; cost: string; duration: string }>> {
  const system = `You suggest activity ideas for groups of Australian friends. Output ONLY valid JSON array, no markdown.

Schema: [{"name": "activity name", "emoji": "single emoji", "reason": "why this fits, max 15 words, casual tone", "match": 75-99, "cost": "$XXpp" or "Free", "duration": "Xhrs" or "Full day"}]

Generate exactly 3 suggestions. Keep names short and specific. Avoid generic ideas like "go for dinner". Be concrete: name actual experiences, neighbourhoods, or types of venues. Tailor to the past hangout patterns.`;

  const user = `Squad: ${opts.squadName}\nLocation: ${opts.location || "Sydney, Australia"}\nBudget: ${opts.budget || "$50-150pp"}\nPast hangouts: ${opts.pastHangouts.join("; ") || "none yet"}`;

  const text = await call(system, user, 600);
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}
