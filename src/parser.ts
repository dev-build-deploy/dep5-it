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
  start: number;
  end: number;
  type: keyof typeof DebianTokens;
};

/**
 * Generates a token from the provided line
 * @param line The line to generate a token from
 * @returns The generated token
 */
function generateToken(line: string): Token | undefined {
  const tokenKeys = Object.keys(DebianTokens) as (keyof typeof DebianTokens)[];

  for (const key of tokenKeys) {
    const match = new RegExp(`${DebianTokens[key].key}:`, "i").exec(line);
    if (match === null) {
      continue;
    }

    return {
      start: match.index,
      end: line.indexOf(":") + 1,
      type: key,
    };
  }
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
                  .split(" ")
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
              .split(" ")
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
