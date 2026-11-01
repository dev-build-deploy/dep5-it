/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

/**
 * Debian Copyright value types
 * @internal
 */
type DebianValueType = "Single-line values" | "Whitespace-separated lists" | "Line-based lists" | "Formatted text";

/**
 * Supported SPDX File tokens
 * @internal
 */
const DebianTokens: { [key: string]: { key: string; type: DebianValueType } } = {
  comment: {
    key: "Comment",
    type: "Formatted text",
  },
  copyright: {
    key: "Copyright",
    type: "Formatted text",
  },
  disclaimer: {
    key: "Disclaimer",
    type: "Formatted text",
  },
  files: {
    key: "Files",
    type: "Whitespace-separated lists",
  },
  format: {
    key: "Format",
    type: "Single-line values",
  },
  license: {
    key: "License",
    type: "Formatted text",
  },
  source: {
    key: "Source",
    type: "Formatted text",
  },
  upstreamName: {
    key: "Upstream-Name",
    type: "Single-line values",
  },
  upstreamContact: {
    key: "Upstream-Contact",
    type: "Line-based lists",
  },
} as const;

/**
 * Resulting token
 * @internal
 */
type Token = {
  end: number;
  type: keyof typeof DebianTokens | undefined;
};

/**
 * A field starts at the beginning of a line with its name and a colon (deb822). Lines starting with a
 * space or tab continue the previous field, so a key in a continuation line is data, not a new field.
 * @internal
 */
const FIELD_PATTERN = /^([^\s:#][^\s:]*):/;

/**
 * Generates a token from the provided line, but only when the line starts a field (i.e. it is not a
 * continuation line).
 * @param line The line to generate a token from
 * @returns The generated token (with an `undefined` type for fields this parser does not know),
 *          or `undefined` if the line does not start a field
 */
function generateToken(line: string): Token | undefined {
  const match = FIELD_PATTERN.exec(line);
  if (match === null) return undefined;

  const name = match[1].toLowerCase();
  const type = (Object.keys(DebianTokens) as (keyof typeof DebianTokens)[]).find(
    key => DebianTokens[key].key.toLowerCase() === name
  );

  return { end: match[0].length, type };
}

/**
 * Extracted value
 * @internal
 */
interface IValue {
  type: keyof typeof DebianTokens;
  data: string | string[];
}

/**
 * Extracts the data from the provided comment
 * @param comment The comment to extract the data from
 * @internal
 */
export function* extractData(paragraph: string): Generator<IValue> {
  let currentToken: DebianValueType | undefined = undefined;
  let currentData: IValue | undefined = undefined;

  paragraph = paragraph.trim();

  for (const line of paragraph.split("\n")) {
    // Lines starting with '#' are comments (deb822)
    if (line.startsWith("#")) continue;

    const match = generateToken(line);
    if (!match) {
      if (currentData && currentToken) {
        switch (currentToken) {
          case "Formatted text":
            if (typeof currentData.data === "string") {
              if (currentData.data.length > 0) {
                currentData.data += `\n${line.trim()}`;
              } else {
                currentData.data = line.trim();
              }
            }
            break;
          case "Line-based lists":
            if (Array.isArray(currentData.data) && line.trim().length > 0) {
              currentData.data.push(line.trim());
            }
            break;
          case "Whitespace-separated lists":
            if (Array.isArray(currentData.data) && line.trim().length > 0) {
              currentData.data = currentData.data.concat(
                line
                  .trim()
                  .split(/\s+/)
                  .filter(item => item.length > 0)
              );
            }
            break;
        }
      }
    } else {
      if (currentData) {
        yield currentData;
        currentData = undefined;
      }

      // Unknown fields (e.g. X-* or Files-Excluded) are skipped, including their continuation lines
      if (match.type === undefined) {
        currentToken = undefined;
        continue;
      }

      currentToken = DebianTokens[match.type].type;

      switch (DebianTokens[match.type].type) {
        case "Single-line values":
          yield { type: match.type, data: line.substring(match.end).trim() };
          break;

        case "Formatted text":
          currentData = { type: match.type, data: line.substring(match.end).trim() };
          break;

        case "Line-based lists":
          currentData = { type: match.type, data: [line.substring(match.end).trim()] };
          break;

        case "Whitespace-separated lists":
          currentData = {
            type: match.type,
            data: line
              .substring(match.end)
              .trim()
              .split(/\s+/)
              .filter(item => item.length > 0),
          };
          break;
      }
    }
  }

  if (currentData) {
    yield currentData;
  }
}
