// src/services/aiClient.ts
const BASE_URL = "http://localhost:4000";

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

export async function classifyTone(message: string): Promise<ToneResult> {
  const res = await fetch(`${BASE_URL}/api/classifyTone`, {
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
  const res = await fetch(`${BASE_URL}/api/rewriteTone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, targetTone })
  });

  if (!res.ok) {
    throw new Error("Failed to rewrite tone");
  }

  return res.json();
}
