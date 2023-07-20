/* 
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import * as debian from "../src/index";
import * as fs from "fs";

/**
 * Validates the SPDX header of a file.
 */
describe("Debian Copyright", () => {
  test("Validate Files", async () => {
    for (const entry of fs.readdirSync("test/fixtures")) {
      if (fs.statSync(`test/fixtures/${entry}`).isDirectory() || entry.endsWith(".fixture")) continue;

      const fixture = JSON.parse(fs.readFileSync(`test/fixtures/${entry}.fixture`, "utf8"));
      const file = `test/fixtures/${entry}`;

      const dep5 = debian.DebianCopyright.fromFile(file);
      console.log(JSON.stringify(dep5, null, 2));
      expect(JSON.parse(JSON.stringify(dep5))).toStrictEqual(fixture);
    }
  });
});
