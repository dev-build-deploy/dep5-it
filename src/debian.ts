/* 
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import * as fs from "fs";
import { extractData } from "./parser";

/**
 * Debian Copyright Header
 * @interface IHeader
 * @member format URI of the format specification
 * @member upstreamName The name upstream uses for the software
 * @member upstreamContact The preferred address(es) to reach the upstream project
 * @member source An explanation from where the upstream source came from. Typically this would be a URL, but it might be a free-form explanation
 * @member disclaimer Disclaimer message
 * @member comment Additional comments
 * @member license Software License
 * @member copyright List of copyright statements
 */
interface IHeader {
  /** URI of the format specification */
  format: string;
  /** The name upstream uses for the software */
  upstreamName?: string;
  /** The preferred address(es) to reach the upstream project */
  upstreamContact?: string[];
  /** An explanation from where the upstream source came from. Typically this would be a URL, but it might be a free-form explanation */
  source?: string;
  /** Disclaimer message */
  disclaimer?: string;
  /** Additional comments */
  comment?: string;
  /** Software License */
  license?: string;
  /** Copyright statements */
  copyright?: string;
}

/**
 * Debian File stanza
 * @interface IFile
 * @member files List of files (can contain wildcards)
 * @member license Software License
 * @member comment Additional comments
 * @member copyright Copyright statements
 */
interface IFile {
  /** List of files (can contain wildcards) */
  files: string[];
  /** Software License */
  license: string;
  /** Additional comments */
  comment?: string;
  /** Copyright statements */
  copyright: string;
}

/** Debian Copyright
 * @interface IDebianCopyright
 * @member header Debian Copyright Header
 * @member files List of file-stanzas
 */
interface IDebianCopyright {
  /** Debian Copyright Header */
  header: IHeader;
  /** List of file-stanzas */
  files: IFile[];
}

/**
 * Debian Copyright
 * @class DebianCopyright
 */
export class DebianCopyright implements IDebianCopyright {
  header: IHeader;
  files: IFile[];

  constructor(header: IHeader = {
    format: "https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/"
  }, files: IFile[] = []) {
    this.header = header;
    this.files = files;
  }

  /**
   * Parse a debian/copyright file (.dep5)
   * @param file Path to the file
   * @returns Debian Copyright object
   */
  static fromFile(file: string): DebianCopyright {
    const content = fs.readFileSync(file, "utf-8");

    const paragraphs = content.split("\n\n").filter(paragraph => paragraph.trim().length > 0);

    // First paragraph MUST be the header.
    return new DebianCopyright(
      DebianHeader.fromParagraph(paragraphs[0]),
      paragraphs.splice(1).map(paragraph => DebianFile.fromParagraph(paragraph))
    );
  }
}

/**
 * Debian Copyright Header
 * @class DebianHeader
 */
class DebianHeader implements IHeader {
  format: string;
  upstreamName?: string;
  upstreamContact?: string[];
  source?: string;
  disclaimer?: string;
  comment?: string;
  license?: string;
  copyright?: string;

  constructor(format: string) {
    this.format = format;
  }

  /**
   * Converts a paragraph to a Debian Copyright Header object
   * @param paragraph Paragraph to convert
   * @returns Debian Copyright Header object
   */
  static fromParagraph(paragraph: string): DebianHeader {
    const header = new DebianHeader("");
    for (const token of extractData(paragraph)) {
      switch (token.type) {
        case "format":
          if (typeof token.data === "string") {
            header.format = token.data;
          }
          break;
        case "upstreamName":
          if (typeof token.data === "string") {
            header.upstreamName = token.data;
          }
          break;
        case "upstreamContact":
          if (Array.isArray(token.data)) {
            header.upstreamContact = token.data;
          }
          break;
        case "source":
          if (typeof token.data === "string") {
            header.source = token.data;
          }
          break;
        case "disclaimer":
          if (typeof token.data === "string") {
            header.disclaimer = token.data;
          }
          break;
        case "comment":
          if (typeof token.data === "string") {
            header.comment = token.data;
          }
          break;
        case "license":
          if (typeof token.data === "string") {
            header.license = token.data;
          }
          break;
        case "copyright":
          if (typeof token.data === "string") {
            header.copyright = token.data;
          }
          break;
      }
    }
    return header;
  }
}

/**
 * Debian File stanza
 * @class DebianFile
 */
class DebianFile implements IFile {
  files: string[];
  copyright: string;
  license: string;
  comment?: string;

  constructor(files: string[], copyright: string, license: string) {
    this.files = files;
    this.copyright = copyright;
    this.license = license;
  }

  /**
   * Converts a paragraph to a Debian File Stanza object
   * @param paragraph Paragraph to convert
   * @returns Debian File Stanza object
   */
  static fromParagraph(paragraph: string): DebianFile {
    const file = new DebianFile([], "", "");
    for (const token of extractData(paragraph)) {
      switch (token.type) {
        case "files":
          if (Array.isArray(token.data)) {
            file.files = token.data;
          }
          break;
        case "copyright":
          if (typeof token.data === "string") {
            file.copyright = token.data;
          }
          break;
        case "comment":
          if (typeof token.data === "string") {
            file.comment = token.data;
          }
          break;
        case "license":
          if (typeof token.data === "string") {
            file.license = token.data;
          }
          break;
      }
    }
    return file;
  }
}
