/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

/**
 * Matches the provided filename against the provided wildcard pattern in accordance
 * to the DEB5 specification:
 *
 *   Only the wildcards * and ? apply; the former matches any number of characters (including none),
 *   the latter a single character. Both match slashes (/) and leading dots, unlike shell globs. The
 *   pattern *.in therefore matches any file whose name ends in .in anywhere in the source tree, not
 *   just at the top level.
 *
 * A backslash removes the special meaning of the next character: \* matches a literal asterisk,
 * \? a literal question mark and \\ a literal backslash.
 *
 * @param fileName Filename to match
 * @param pattern Wildcard pattern to match against
 * @returns True if the filename matches the pattern, false otherwise
 * @internal
 */
export function isWildcardMatch(fileName: string, pattern: string): boolean {
  if (pattern === "*") return true;

  let expression = "";
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === "\\" && index + 1 < pattern.length) {
      index++;
      expression += escapeRegExp(pattern[index]);
    } else if (char === "*") {
      expression += "[\\s\\S]*";
    } else if (char === "?") {
      expression += "[\\s\\S]";
    } else {
      expression += escapeRegExp(char);
    }
  }

  return new RegExp(`^${expression}$`).test(fileName);
}

/**
 * Escapes a character (or string) for use in a regular expression
 * @param value Value to escape
 * @returns The escaped value
 * @internal
 */
function escapeRegExp(value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
