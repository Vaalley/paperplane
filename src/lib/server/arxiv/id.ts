const ARXIV_ID_PATTERN = /^(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?$/i;

export function normalizeArxivId(rawId: string): string | null {
  const value = rawId.trim().replace(/^arXiv:/i, '');
  let candidate = value;

  try {
    const url = new URL(value);
    const marker = '/abs/';
    const markerIndex = url.pathname.indexOf(marker);
    candidate = markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length) : '';
  } catch {
    // Bare arXiv identifiers are valid too.
  }

  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return null;
  }

  return ARXIV_ID_PATTERN.test(candidate) ? candidate : null;
}
