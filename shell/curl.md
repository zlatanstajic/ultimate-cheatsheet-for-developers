---
last_reviewed: 2026-06-08
---

# cURL

> Command line tool and library for transferring data with URLs.

Read more about [cURL](https://curl.se/).

## Table of Contents

* [Misc](#misc)
* [Methods & Data](#methods--data)
* [Debug](#debug)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Misc

```bash
# Get HTTP headers for a URL (follow redirects with -L)
curl -sI -L [url]

# Get page content (suppress progress meter)
curl [url]

# Download to file using a local name
curl -o [file] [url]

# Download to file using the remote file name
curl -O [url]

# Resume a download (-C - auto-detects offset)
curl -C - -O -L [url]

# Send a GET request with basic authentication and pretty-print JSON response
curl -s -u [username]:[password] [url] | jq .

# Send a GET request with bearer token authentication
curl -s -H "Authorization: Bearer [token]" [url] | jq .

# Post JSON data (--data implies POST; no need for -X POST)
curl -s -H "Content-Type: application/json" --data '[json-data]' [url]

# Post JSON from a file
curl -s -H "Content-Type: application/json" --data @payload.json [url]

# Get HTTP status code only (use --fail to exit non-zero on HTTP >= 400)
curl -s -o /dev/null -w "%{http_code}\n" -L [url]

# Same, but fail the script on HTTP errors
curl --fail -s -o /dev/null -w "%{http_code}\n" -L [url]

# Send request with gzip compression support
curl -s --compressed [url]
```

[⬆ back to top](#table-of-contents)

## Methods & Data

```bash
# Send an explicit request method (PUT, PATCH, DELETE, etc.)
curl -s -X [method] [url]

# Post form-encoded fields (-d implies POST and sets the form content type)
curl -s -d "[field]=[value]" -d "[field]=[value]" [url]

# Post a field while URL-encoding its value (handles spaces and special chars)
curl -s --data-urlencode "[field]=[value]" [url]

# Read a field value from a file, URL-encoded under a given name
curl -s --data-urlencode "[field]@[file]" [url]

# Upload a file as multipart/form-data (-F sets multipart automatically)
curl -s -F "[field]=@[file]" [url]

# Multipart upload with an explicit content type for the part
curl -s -F "[field]=@[file];type=[mime-type]" [url]

# Send a multipart text field alongside a file upload
curl -s -F "[field]=[value]" -F "[field]=@[file]" [url]
```

[⬆ back to top](#table-of-contents)

## Debug

```bash
# Verbose output: show request/response headers and TLS handshake
curl -v [url]

# Full wire trace (binary + ASCII) written to a file
curl --trace [file] [url]

# Trace as ASCII with timestamps
curl --trace-ascii [file] [url]

# Timing breakdown of the request phases
curl -s -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} ttfb:%{time_starttransfer} total:%{time_total}\n" [url]

# Limit how long the initial connection may take
curl --connect-timeout [seconds] [url]

# Cap the total time allowed for the whole operation
curl --max-time [seconds] [url]

# Retry transient failures with exponential backoff
curl --retry [count] --retry-delay [seconds] [url]

# Retry on connection refused / reset as well as transient HTTP errors
curl --retry [count] --retry-connrefused [url]
```

[⬆ back to top](#table-of-contents)

## Notes

* Prefer [`jq`](https://jqlang.github.io/jq/) over `json_pp` for JSON pretty-printing — it is faster, more portable, and supports filtering.
* Avoid `-X POST` when using `--data` or `-d`; curl infers the method automatically.
* Prefer bearer token auth (`-H "Authorization: Bearer [token]"`) over `-u user:pass` for API calls to avoid credentials leaking in process listings.
* Add `--compressed` when the server supports gzip/brotli to reduce transfer size.
* In shell scripts, always add `--fail` so curl exits with a non-zero code on HTTP 4xx/5xx responses.
* On Windows/PowerShell, use double quotes carefully; prefer storing JSON in a file and using `--data @file.json`.
* Use `--data-urlencode` instead of `-d` when a field value contains spaces or special characters — plain `-d` does not encode them.
* `-F` switches the request to `multipart/form-data`; do not mix it with `-d` in the same request.
* Always pair `--retry` with `--max-time` (or `--connect-timeout`) so a hung host cannot make retries run indefinitely.
* `-w` accepts many variables (`%{http_code}`, `%{time_total}`, ...) and is the lightweight way to script timing and status checks without extra tooling.

[⬆ back to top](#table-of-contents)
