export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number): string {
  return `${new Intl.NumberFormat('es-CL').format(value)} km`;
}

/** Join Astro `base` with a site path. Keeps a single slash even if base lacks a trailing slash. */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const cleanBase = base.replace(/\/+$/, '') || '';
  if (!path || path === '/') return `${cleanBase}/`;
  // Preserve hash-only anchors like "/#stock"
  if (path.startsWith('/#')) return `${cleanBase}/${path.slice(1)}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isWeakMobile(): boolean {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  const narrow = window.matchMedia('(max-width: 720px)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  return Boolean(saveData) || (narrow && ((mem !== undefined && mem <= 4) || cores <= 4));
}
