/**
 * Lightweight server-side check for possible acute risk language.
 * Intentionally conservative; complements (does not replace) model safety instructions.
 */
export function mayIndicateAcuteRisk(text: string): boolean {
  const t = text.toLowerCase();
  const patterns = [
    "suicid",
    "kill myself",
    "kill my self",
    "end my life",
    "want to die",
    "wanna die",
    "better off dead",
    "self harm",
    "self-harm",
    "hurt myself",
    "cut myself",
    "no reason to live",
    "end it all",
    "can't go on",
    "cannot go on",
    "unalive",
  ];
  return patterns.some((p) => t.includes(p));
}

export const CRISIS_RESPONSE = `Acknowledgment:
I'm really sorry you're going through this, and I'm glad you said something—what you're carrying sounds far too heavy to face alone.

Insight:
This moment calls for caring people and trained professionals who can be with you in real time, not an app trying to manage a crisis.

Suggestion:
If you can, please reach out now: contact local emergency services or a crisis helpline where you live, or go to the nearest emergency department. In the U.S., you can call or text 988 (Suicide & Crisis Lifeline); elsewhere, search for your country's crisis line or ask emergency services for the right number.

Follow-up:
Are you somewhere physically safe right now, and is there one trusted person you could message or call while you connect with professional or crisis support?`;
