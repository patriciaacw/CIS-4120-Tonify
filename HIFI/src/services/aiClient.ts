//Generated with assistance from Chat GPT – Nov 8, 2025
// src/services/aiClient.ts

export type ToneType = "positive" | "neutral" | "negative" | "uncertain";

export interface ToneResult {
  label: string;
  type: ToneType;
  explanation: string;
  confidence: number;
  suggestions?: string[];
}

export interface RewriteResult {
  suggestions: string[];
}

const API_BASE = ""; // same-origin

export async function classifyTone(message: string): Promise<ToneResult> {
  const res = await fetch('/api/classifyTone', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!res.ok) {
    throw new Error("Failed to classify tone");
  }

  return res.json();
}

export async function rewriteTone(
  message: string,
  targetTone: string
): Promise<RewriteResult> {
  const res = await fetch('/api/rewriteTone', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, targetTone })
  });

  if (!res.ok) {
    throw new Error("Failed to rewrite tone");
  }

  return res.json();
}
