// Feature: website-template-repo, Property 12: Commitlint validates conventional commits

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import lint from "@commitlint/lint";
import conventionalConfig from "@commitlint/config-conventional";

/** Conventional commit types from @commitlint/config-conventional */
const VALID_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
] as const;

/**
 * Arbitrary that produces a valid conventional commit message.
 * Format: `type(scope): description` or `type: description`
 */
const validCommitArb = fc
  .record({
    type: fc.constantFrom(...VALID_TYPES),
    scope: fc.option(fc.stringMatching(/^[a-z][a-z0-9-]{0,11}$/), {
      nil: undefined,
    }),
    description: fc.stringMatching(/^[a-z][a-z0-9 -]{0,49}$/).filter(
      (s) => s.trim().length > 0 && !s.endsWith(" "),
    ),
  })
  .map(({ type, scope, description }) =>
    scope
      ? `${type}(${scope}): ${description}`
      : `${type}: ${description}`,
  );

/**
 * Arbitrary that produces strings which should NOT pass commitlint.
 * Strategies:
 *  - Random alphanumeric strings without colon separator
 *  - Uppercase type prefix (config-conventional requires lowercase)
 *  - Invalid type prefix not in the conventional list
 *  - Type with colon but empty description
 */
const invalidCommitArb = fc.oneof(
  // Random string without a colon — no valid type: description structure
  fc
    .stringMatching(/^[a-z0-9 ]{1,60}$/)
    .filter((s) => !s.includes(":") && s.trim().length > 0),

  // Uppercase type — config-conventional requires lowercase
  fc
    .record({
      type: fc.constantFrom(...VALID_TYPES),
      desc: fc.stringMatching(/^[a-z][a-z0-9 ]{0,29}$/).filter(
        (s) => s.trim().length > 0 && !s.endsWith(" "),
      ),
    })
    .map(({ type, desc }) => `${type.toUpperCase()}: ${desc}`),

  // Invalid type prefix (not in the conventional list)
  fc
    .record({
      type: fc.constantFrom("foo", "bar", "baz", "update", "change", "misc"),
      desc: fc.stringMatching(/^[a-z][a-z0-9 ]{0,29}$/).filter(
        (s) => s.trim().length > 0 && !s.endsWith(" "),
      ),
    })
    .map(({ type, desc }) => `${type}: ${desc}`),

  // Type with colon but empty description
  fc.constantFrom(...VALID_TYPES).map((type) => `${type}:`),
);

describe("Property 12: Commitlint validates conventional commits", () => {
  /**
   * Validates: Requirements 30.3
   *
   * For any string matching `type(scope): description` with a valid
   * conventional commit type, commitlint should pass validation.
   */
  it("should accept valid conventional commit messages", async () => {
    await fc.assert(
      fc.asyncProperty(validCommitArb, async (message) => {
        const result = await lint(message, conventionalConfig.rules);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 30.3
   *
   * For any string that does not match the conventional commit pattern,
   * commitlint should reject it.
   */
  it("should reject invalid commit messages", async () => {
    await fc.assert(
      fc.asyncProperty(invalidCommitArb, async (message) => {
        const result = await lint(message, conventionalConfig.rules);
        expect(result.valid).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
