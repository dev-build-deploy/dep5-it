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
 * TODO: Implement support for the ? wildcard
 *
 * @param fileName Filename to match
 * @param pattern Wildcard pattern to match against
 * @returns True if the filename matches the pattern, false otherwise
 * @internal
 */
export function isWildcardMatch(fileName: string, pattern: string): boolean {
  if (pattern === "*") return true;

  return new RegExp(
    `^${pattern
      .split("*")
      .map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
      .join(".*")}$`
  ).test(fileName);
}
