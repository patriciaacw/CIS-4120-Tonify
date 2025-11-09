//Generated with assistance from Chat GPT – Nov 8, 2025

// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// need open ai api key
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TONE_LABELS = [
  "friendly",
  "neutral",
  "harsh",
  "passive-aggressive",
  "apologetic"
];

//classify tone
app.post("/api/classifyTone", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Tonify, a tone classifier for text messages.\n" +
            "Given a single message, return STRICT JSON with keys:\n" +
            "  - label: short human-readable tone name\n" +
            "  - type: one of 'positive', 'neutral', 'negative', 'uncertain'\n" +
            "  - explanation: 1–2 sentences explaining how the message might be perceived\n" +
            "  - confidence: integer 0–100\n" +
            "  - suggestions: an array of 0–3 short improvement suggestions (strings).\n" +
            "DO NOT include anything except that JSON."
        },
        {
          role: "user",
          content: `Classify the tone of this message:\n"${message}"`
        }
      ]
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");

    res.json({
      label: data.label || "Neutral",
      type: data.type || "neutral",
      explanation: data.explanation || "Message has a generally neutral tone.",
      confidence: data.confidence ?? 76,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tone classification failed" });
  }
});

//rewrite tone
app.post("/api/rewriteTone", async (req, res) => {
  try {
    const { message, targetTone } = req.body;
    if (!message || !targetTone) {
      return res
        .status(400)
        .json({ error: "message and targetTone are required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Tonify, a tone rewriter for chat messages.\n" +
            "Given a user's original message and a desired tone, you create 2–3 alternative rewrites.\n" +
            "Preserve the original meaning but adjust tone and phrasing.\n" +
            "Return STRICT JSON: { \"suggestions\": [\"...\", \"...\"] } only."
        },
        {
          role: "user",
          content:
            `Original message:\n"${message}"\n` +
            `Desired tone/style: ${targetTone}`
        }
      ]
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");

    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      return res
        .status(500)
        .json({ error: "No suggestions returned from model" });
    }

    res.json({ suggestions: data.suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tone rewriting failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Tonify AI server running on http://localhost:${PORT}`);
});
