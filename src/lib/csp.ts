/**
 * Content-Security-Policy builder.
 *
 * Produces a CSP header string from a configurable set of directive → source
 * lists. Each directive is semicolon-separated; sources within a directive are
 * space-separated.
 */

/** Per-directive source list configuration. */
export interface CSPConfig {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "connect-src"?: string[];
  "font-src"?: string[];
  "object-src"?: string[];
  "media-src"?: string[];
  "frame-src"?: string[];
  "frame-ancestors"?: string[];
  "base-uri"?: string[];
  "form-action"?: string[];
  "upgrade-insecure-requests"?: boolean;
}

/** Sensible defaults for a Next.js site. */
const DEFAULT_CSP: CSPConfig = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'"],
  "font-src": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "upgrade-insecure-requests": true,
};

/**
 * Merge user-supplied config on top of the defaults.
 *
 * Array directives are concatenated (defaults first, then user values).
 * Boolean directives use the user value when provided.
 */
function deduplicatedConcat(base: string[], additions: string[]): string[] {
  const seen = new Set(base);
  const combined = [...base];
  for (const src of additions) {
    if (!seen.has(src)) {
      combined.push(src);
      seen.add(src);
    }
  }
  return combined;
}

function mergeConfigs(base: CSPConfig, overrides: CSPConfig): CSPConfig {
  const merged: CSPConfig = { ...base };

  for (const key of Object.keys(overrides) as (keyof CSPConfig)[]) {
    const value = overrides[key];
    if (value === undefined) continue;

    if (key === "upgrade-insecure-requests") {
      merged[key] = Boolean(value);
      continue;
    }

    const baseVal = base[key];
    const baseArr = Array.isArray(baseVal) ? baseVal : [];
    const overArr = Array.isArray(value) ? value : [];
    (merged as Record<string, unknown>)[key] = deduplicatedConcat(baseArr, overArr);
  }

  return merged;
}


/**
 * Build a Content-Security-Policy header string.
 *
 * @param config - Optional overrides / additions to the default CSP.
 *                 When omitted the sensible defaults are used as-is.
 * @returns A valid CSP header value.
 */
export function buildCSP(config: CSPConfig = {}): string {
  const effective = mergeConfigs(DEFAULT_CSP, config);
  const parts: string[] = [];

  for (const [directive, value] of Object.entries(effective)) {
    if (value === undefined) continue;

    if (directive === "upgrade-insecure-requests") {
      if (value === true) {
        parts.push("upgrade-insecure-requests");
      }
    } else if (Array.isArray(value) && value.length > 0) {
      parts.push(`${directive} ${value.join(" ")}`);
    }
  }

  return parts.join("; ");
}
