/*
SPDX-FileCopyrightText: 2026 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import * as debian from "../src/index";

/**
 * Conformance with the Debian machine-readable copyright format 1.0
 * (https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/).
 */
describe("Debian copyright-format 1.0 conformance", () => {
  test("The last matching Files paragraph wins", () => {
    // "If multiple Files declarations match the same file, then only the last match counts."
    const dep5 = debian.DebianCopyright.fromFile("test/spec/last-match.dep5");

    expect(dep5.getFileStanza("assets/logo.png")?.license).toBe("CC0-1.0");
    expect(dep5.getFileStanza("assets/tree.png")?.license).toBe("CC-BY-4.0");
    expect(dep5.getFileStanza("src/index.ts")?.license).toBe("MIT");
  });

  test("Keys only start at the beginning of a non-continuation line", () => {
    const dep5 = debian.DebianCopyright.fromFile("test/spec/continuation.dep5");

    expect(dep5.header.license).toBeUndefined();
    expect(dep5.header.copyright).toBeUndefined();
    expect(dep5.header.comment).toBe(
      "Keys only count at the start of a line.\n" +
        "This continuation line mentions License: GPL-3.0-only and\n" +
        "Copyright: 1999 Nobody, which are part of the comment."
    );

    expect(dep5.files).toHaveLength(2);
    expect(dep5.files[0]).toEqual({
      files: ["src/*"],
      copyright: "2023 Kevin de Jong <monkaii@hotmail.com>",
      license: "MIT\nThe License: and Copyright: words in this licence text\nbelong to the licence text.",
      comment: "Generated, see the Files: list\nand Source: hints in here.",
    });
    expect(dep5.files[1]).toEqual({
      files: ["docs/*", "docs/*.md", "tools/*"],
      copyright: "2024 Docs Writer",
      license: "CC-BY-4.0",
    });
  });
});
