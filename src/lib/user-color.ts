/** Stable hue 0–359 for a user id (avatars, cursor accents). */
export function getUserHue(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

export function getUserColorCss(userId: string): {
  ring: string;
  dot: string;
  label: string;
} {
  const hue = getUserHue(userId);
  return {
    ring: `hsla(${hue}, 72%, 58%, 0.95)`,
    dot: `hsl(${hue}, 70%, 52%)`,
    label: `hsla(${hue}, 85%, 78%, 1)`,
  };
}

export function initialsFromLabel(label: string, fallbackId: string): string {
  const s = label.trim() || fallbackId;
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase().slice(0, 2);
  return s.slice(0, 2).toUpperCase();
}
