# Pinterest URL Audit

A GitHub Action that finds Pinterest URLs in repository text files, validates their hosts and paths, and suggests canonical forms. It runs locally inside the workflow and makes no network requests.

The team behind the [Pinterest image downloader](https://savepinner.com) maintains the parser used by this action.

## Usage

```yaml
name: Audit Pinterest URLs

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: jiankn/pinterest-url-audit-action@v1
        with:
          fail-on-invalid: "true"
```

By default, the action scans Markdown, MDX, text, JSON, JSONL, CSV, and YAML files. Invalid Pinterest-like URLs become workflow warnings. URLs with tracking parameters or regional hosts receive a canonical URL suggestion.

## Inputs

| Input | Default | Purpose |
| --- | --- | --- |
| `paths` | Common text-file globs | Multiline glob patterns to scan. |
| `fail-on-invalid` | `false` | Fail the workflow if invalid Pinterest-like URLs are found. |

## Outputs

| Output | Purpose |
| --- | --- |
| `valid-count` | Number of supported Pinterest URLs found. |
| `invalid-count` | Number of invalid Pinterest-like URLs found. |

## Safety

- No Pinterest pages are requested.
- No media is downloaded.
- Hostnames are checked against an exact allow list.
- Lookalike domains and non-HTTPS URLs are rejected.

The parser is also available as [`pinterest-url-normalizer`](https://www.npmjs.com/package/pinterest-url-normalizer). Pinterest is a trademark of Pinterest, Inc. This project is independent and is not affiliated with or endorsed by Pinterest.

## License

MIT
