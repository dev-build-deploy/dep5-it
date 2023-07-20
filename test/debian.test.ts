/* 
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import * as debian from "../src/index";
import * as fs from "fs";

/**
 * Validates the Debian Copyright file parser.
 */
describe("Debian Copyright", () => {
  test("Validate Files", async () => {
    for (const entry of fs.readdirSync("test/fixtures")) {
      if (fs.statSync(`test/fixtures/${entry}`).isDirectory() || entry.endsWith(".fixture")) continue;

      const fixture = JSON.parse(fs.readFileSync(`test/fixtures/${entry}.fixture`, "utf8"));
      const file = `test/fixtures/${entry}`;

      const dep5 = debian.DebianCopyright.fromFile(file);

      expect(JSON.parse(JSON.stringify(dep5))).toStrictEqual(fixture);
    }
  });

  test("Retrieve File Stanza", async () => {
    const file = `test/fixtures/basic-file.dep5`;

    const dep5 = debian.DebianCopyright.fromFile(file);
    const stanza = dep5.getFileStanza("test/fixtures/basic-file.dep5");

    expect(JSON.parse(JSON.stringify(stanza))).toStrictEqual({
      files: ["test/fixtures/*"],
      copyright: "2023 Kevin de Jong <monkaii@hotmail.com>",
      license: "MIT",
    });
  });
});
