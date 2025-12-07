// src/services/toneApi.ts
export type ToneType = 'positive' | 'neutral' | 'negative' | 'uncertain';

export interface ToneResult {
    label: string;
    type: ToneType;
    explanation: string;
    confidence?: number;
    suggestions?: string[];
}

const API_BASE = ""; // same-origin

export async function classifyTone(message: string): Promise<ToneResult | undefined> {
    try {
        const res = await fetch('/api/classifyTone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        if (!res.ok) {
            console.error('Tone API error:', await res.text());
            return;
        }

        const data = await res.json();
        return data as ToneResult;
    } catch (err) {
        console.error('Tone API request failed:', err);
    }
}
