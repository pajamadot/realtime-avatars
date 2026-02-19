export const PRESENTER_SECRET_ROUTE = '/presenter-script-6f2a9c17';
export const PRESENTATION_BASE_URL = 'https://www.realtime-avatars.com';
export const PRESENTER_SLIDE_COUNT = 35;

export function encodeSlideToken(slide: number): string {
  return Buffer.from(`slide:${slide}:v1`, 'utf8').toString('base64url');
}

export function decodeSlideToken(token: string): number | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const match = /^slide:(\d+):v1$/.exec(raw);
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isInteger(value)) return null;
    if (value < 1 || value > PRESENTER_SLIDE_COUNT) return null;
    return value;
  } catch {
    return null;
  }
}

