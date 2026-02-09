export function formatISODate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function asTime(iso?: string) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

export function formatStars(n?: number) {
  const v = Number(n ?? 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(v);
}

export const METHOD_COLOR: Record<string, string> = {
  metahuman: 'var(--color-metahuman)',
  generative: 'var(--color-generative)',
  gaussian: 'var(--color-gaussian)',
  streaming: 'var(--color-streaming)',
};
