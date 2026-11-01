/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import { isWildcardMatch } from "../src/wildcard";

/**
 * Validates wildcard pattern matching
 */
describe("Wildcard", () => {
  test("Validate Wildcard Patterns", async () => {
    for (const [value, pattern, expectation] of [
      ["anything", "*", true],
      ["example.ts", "*.ts", true],
      ["example.js", "*.ts", false],
      ["good-example.ts", "good-*.ts", true],
      ["bad-example.ts", "good-*.ts", false],
      ["bad-example.ts", "good-*.ts", false],
      ["good-example.ts", "good-example.ts", true],
      ["src/deep/example.ts", "*.ts", true],
      ["file1.txt", "file?.txt", true],
      ["file10.txt", "file?.txt", false],
      ["a/b", "a?b", true],
      ["star*.txt", "star\\*.txt", true],
      ["starry.txt", "star\\*.txt", false],
      ["what?.txt", "what\\?.txt", true],
      ["whats.txt", "what\\?.txt", false],
      ["back\\slash", "back\\\\slash", true],
    ]) {
      expect(isWildcardMatch(value as string, pattern as string)).toBe(expectation);
    }
  });
});
