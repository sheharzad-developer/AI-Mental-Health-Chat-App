/**
 * Generates synthetic training data for fine-tuning a wellness model.
 *
 * Output: training-data/wellness.jsonl  (OpenAI fine-tuning format)
 * Also: training-data/wellness.md       (human-readable for review)
 *
 * Run:
 *   node --env-file=.env scripts/generate-training-data.mjs           # default 5 per topic
 *   node --env-file=.env scripts/generate-training-data.mjs --per 10  # 10 per topic
 *   node --env-file=.env scripts/generate-training-data.mjs --topics 5 --per 3   # quick smoke test
 *
 * Cost estimate (Claude 4.5 Sonnet @ ~$3/M input, $15/M output):
 *   ~50 topics × 5 examples × ~600 tokens out = ~$2-4 per full run.
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TOPICS, TONE_VARIATIONS } from "./topics.mjs";

// ----- Args -----
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const PER_TOPIC = Number(getArg("--per", "5"));
const TOPIC_LIMIT = Number(getArg("--topics", String(TOPICS.length)));
// Default provider: anthropic if key set, else gemini
const DEFAULT_PROVIDER = process.env.ANTHROPIC_API_KEY ? "anthropic" : "gemini";
const PROVIDER = getArg("--provider", DEFAULT_PROVIDER);
const MODEL = getArg(
  "--model",
  PROVIDER === "gemini" ? "gemini-2.5-pro" : "claude-sonnet-4-5"
);

const SYSTEM_PROMPT = `You are an AI Wellness Companion designed for a mobile app.

You provide warm, emotionally intelligent support. You are NOT a therapist or doctor and never diagnose or prescribe.

RESPONSE FORMAT (mandatory):

Acknowledgment:
<2-3 sentences reflecting back what they shared specifically>

Insight:
<2-4 sentences offering a thoughtful perspective>

Suggestion:
<1-2 sentences with ONE small optional action>

Follow-up:
1. <specific question about the feeling>
2. <specific question about context or cause>
3. <specific question about what they need>

Style:
- Warm, human, calm, like a thoughtful friend who pays attention
- 8-14 sentences total across all four sections
- Specific to what the user said, not generic affirmations
- Do not use markdown around section labels`;

const META_PROMPT_TEMPLATE = ({ topic, count }) => `Generate ${count} training conversations for fine-tuning an AI wellness companion.

Topic: "${topic}"

For each conversation, output:
1. A realistic user message (vary the tone, length, and style — see variations list)
2. An ideal assistant response in EXACTLY this format (no markdown around labels, no extra prose):

Acknowledgment:
[2-3 sentences referencing specific details from the user's message]

Insight:
[2-4 sentences with substantive perspective, not platitudes]

Suggestion:
[1-2 sentences offering ONE small optional action]

Follow-up:
1. [specific question]
2. [specific question]
3. [specific question]

Tone variations to draw from for user messages:
${TONE_VARIATIONS.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Output your answer as a JSON array. No surrounding prose, no markdown code fences, just the JSON.

Example output:
[
  {
    "user": "i can't sleep again. its 3am",
    "assistant": "Acknowledgment:\\nIt's 3am and your body still won't let you rest — that kind of sleeplessness is its own loneliness. Sounds exhausting.\\n\\nInsight:\\nWhen sleep won't come, the night can feel like it stretches forever and the mind tends to amplify whatever it's already carrying. Your nervous system might be stuck in a wired-tired loop where you're tired enough to want sleep but too activated to drop into it.\\n\\nSuggestion:\\nIf it feels okay, try sitting up briefly with the lights low for ten minutes — sometimes giving up on forcing sleep takes the pressure off and lets it find you.\\n\\nFollow-up:\\n1. What's the texture of your sleeplessness — racing thoughts, body restlessness, or a quiet kind of awake?\\n2. Has this been happening for a while, or is tonight specifically heavy?\\n3. What do you wish someone would say to you right now?"
  }
]

Now generate ${count} examples for the topic above. Return only the JSON array.`;

// ----- Setup -----
let callModel;
if (PROVIDER === "anthropic") {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY. Add it to .env or use --provider gemini.");
    process.exit(1);
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  callModel = async (prompt) => {
    const r = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    return r.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  };
} else if (PROVIDER === "gemini") {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY. Add it to .env or use --provider anthropic.");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.9, maxOutputTokens: 4096 },
  });
  callModel = async (prompt) => {
    const r = await model.generateContent(prompt);
    return r.response.text().trim();
  };
} else {
  console.error(`Unknown provider: ${PROVIDER}. Use anthropic or gemini.`);
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "training-data");
await mkdir(OUT_DIR, { recursive: true });

const jsonlPath = path.join(OUT_DIR, "wellness.jsonl");

// ----- Resume from existing data -----
const RESUME = !args.includes("--fresh");
const { existing } = RESUME ? await loadExistingTopics(jsonlPath) : { existing: [] };
const completedUserMessages = new Set(
  existing
    .map((ex) => ex.messages?.find((m) => m.role === "user")?.content)
    .filter(Boolean)
);
const allExamples = existing.map((ex) => ({
  topic: "(previous run)",
  user: ex.messages.find((m) => m.role === "user")?.content ?? "",
  assistant: ex.messages.find((m) => m.role === "assistant")?.content ?? "",
}));

// ----- Main loop -----
const topicsToProcess = TOPICS.slice(0, TOPIC_LIMIT);
const stoppedOnQuota = { triggered: false };
console.log(
  `Generating ${PER_TOPIC} examples for each of ${topicsToProcess.length} topics using ${PROVIDER}/${MODEL}` +
    (existing.length ? ` · resuming with ${existing.length} existing examples` : "") +
    "\n"
);

const failedTopics = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callWithRetry(prompt, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await callModel(prompt);
    } catch (e) {
      lastErr = e;
      const msg = (e?.message || "").toLowerCase();
      // Daily quota — never retry; would only burn more quota
      if (msg.includes("quota") || msg.includes("billing")) throw e;
      // Transient errors worth retrying
      const transient =
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("high demand") ||
        msg.includes("etimedout") ||
        msg.includes("econnreset");
      if (!transient) throw e;
      const wait = 2000 * Math.pow(2, i);
      process.stdout.write(`(retrying in ${wait / 1000}s…) `);
      await sleep(wait);
    }
  }
  throw lastErr;
}

// Resume support: load topics already processed
async function loadExistingTopics(jsonlPath) {
  try {
    const text = await readFile(jsonlPath, "utf8");
    const seen = new Set();
    const examples = [];
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        examples.push(obj);
      } catch {
        // skip malformed
      }
    }
    return { existing: examples };
  } catch {
    return { existing: [] };
  }
}

for (const [i, topic] of topicsToProcess.entries()) {
  // Skip topics already represented in existing data (rough heuristic — based on count)
  const existingForTopic = allExamples.filter((ex) => ex.topic === topic).length;
  if (existingForTopic >= PER_TOPIC) {
    console.log(`[${i + 1}/${topicsToProcess.length}] ${topic} … (skipped, already have ${existingForTopic})`);
    continue;
  }

  if (stoppedOnQuota.triggered) break;

  process.stdout.write(`[${i + 1}/${topicsToProcess.length}] ${topic} … `);
  try {
    const text = await callWithRetry(META_PROMPT_TEMPLATE({ topic, count: PER_TOPIC }));

    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error("Response was not a JSON array");

    for (const ex of parsed) {
      if (typeof ex.user !== "string" || typeof ex.assistant !== "string") continue;
      if (completedUserMessages.has(ex.user)) continue;
      allExamples.push({ topic, user: ex.user, assistant: ex.assistant });
      completedUserMessages.add(ex.user);
    }
    process.stdout.write(`✓ ${parsed.length}\n`);
    if (i < topicsToProcess.length - 1) await sleep(1500);
  } catch (e) {
    failedTopics.push({ topic, error: e.message });
    process.stdout.write(`✗ ${e.message.slice(0, 120)}\n`);
    if ((e.message || "").toLowerCase().includes("quota")) {
      console.log(`\n⏸  Daily quota exhausted. Stopping. Run the same command tomorrow to resume.`);
      stoppedOnQuota.triggered = true;
    }
  }
}

// ----- Write JSONL (OpenAI fine-tuning format) -----
const jsonlLines = allExamples.map((ex) =>
  JSON.stringify({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: ex.user },
      { role: "assistant", content: ex.assistant },
    ],
  })
);
await writeFile(jsonlPath, jsonlLines.join("\n") + "\n", "utf8");

// ----- Write Markdown for review -----
const mdPath = path.join(OUT_DIR, "wellness.md");
const mdSections = allExamples.map(
  (ex, i) => `## ${i + 1}. ${ex.topic}\n\n**User:**\n\n> ${ex.user.replace(/\n/g, "\n> ")}\n\n**Assistant:**\n\n${ex.assistant}\n`
);
await writeFile(mdPath, `# Training data review (${allExamples.length} examples)\n\n` + mdSections.join("\n---\n\n"), "utf8");

// ----- Summary -----
console.log(`\n✓ Generated ${allExamples.length} examples`);
console.log(`  JSONL: ${path.relative(process.cwd(), jsonlPath)}  (for OpenAI fine-tuning)`);
console.log(`  MD:    ${path.relative(process.cwd(), mdPath)}     (for human review)`);
if (failedTopics.length) {
  console.log(`\n⚠ ${failedTopics.length} topics failed:`);
  failedTopics.forEach((f) => console.log(`  - ${f.topic}: ${f.error}`));
}
