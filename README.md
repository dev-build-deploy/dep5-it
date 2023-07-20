<!--
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
-->

# Dep5It - Debian Copyright (dep5) Management Library

Parses [machine-interpretable Debian Copyright files](https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/) (`.dep5`) into object files.

This can be valuable when extracting License and Copyright statements from the configuration file.

## Features

* Easy to use
* Parsing of Debian Copyright files into objects

## Basic Usage

```typescript
import { DebianCopyright } from "@dev-build-deploy/dep5-it";

// Parse a .dep5 file
const dep5 = DebianCopyright.fromFile(".reuse/dep5");

// Show the results
console.log(JSON.stringify(dep5, null, 2));
```

This will result in the following data structure;

```JSON
{
  "header": {
    "format": "https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/",
    "upstreamName": "dep5-it",
    "upstreamContact": [
      "Kevin de Jong <monkaii@hotmail.com>"
    ],
    "source": "https://github.com/dev-build-deploy/dep5-it"
  },
  "files": [
    {
      "files": [
        "test/fixtures/*"
      ],
      "copyright": "2023 Kevin de Jong <monkaii@hotmail.com>",
      "license": "MIT"
    },
    {
      "files": [
        "tsconfig*.json"
      ],
      "copyright": "2023 Kevin de Jong <monkaii@hotmail.com>",
      "license": "CC0-1.0"
    },
    {
      "files": [
        "package*.json"
      ],
      "copyright": "2023 Kevin de Jong <monkaii@hotmail.com>",
      "license": "CC0-1.0"
    }
  ]
}
```

## Contributing

If you have suggestions for how `dep5-it`` could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

- [MIT](./LICENSES/MIT.txt) © 2023 Kevin de Jong \<monkaii@hotmail.com\>
