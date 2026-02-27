import { z } from 'zod';

const envSchema = z.object({
  // Required — build fails without these
  NEXT_PUBLIC_SITE_URL: z.url(),

  // Optional — warnings only
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  NETLIFY_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const optionalKeys: ReadonlyArray<keyof Env> = [
  'NEXT_PUBLIC_GA_ID',
  'AXIOM_TOKEN',
  'AXIOM_DATASET',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'DISCORD_WEBHOOK_URL',
  'VERCEL_TOKEN',
  'NETLIFY_AUTH_TOKEN',
];

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .filter((issue) => issue.path.length > 0)
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);

    throw new Error(
      `❌ Missing or invalid required environment variables:\n${missing.join('\n')}`,
    );
  }

  for (const key of optionalKeys) {
    if (!result.data[key]) {
      console.warn(`⚠️  Optional env var ${key} is not set`);
    }
  }

  return result.data;
}
