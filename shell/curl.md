# cURL

> Command line tool and library for transferring data with URLs.

Read more about cURL at [curl.se](https://curl.se/).

## Table of Contents

* [Misc](#misc)
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

---

## Notes

* Prefer [`jq`](https://jqlang.github.io/jq/) over `json_pp` for JSON pretty-printing — it is faster, more portable, and supports filtering.
* Avoid `-X POST` when using `--data` or `-d`; curl infers the method automatically.
* Prefer bearer token auth (`-H "Authorization: Bearer [token]"`) over `-u user:pass` for API calls to avoid credentials leaking in process listings.
* Add `--compressed` when the server supports gzip/brotli to reduce transfer size.
* In shell scripts, always add `--fail` so curl exits with a non-zero code on HTTP 4xx/5xx responses.
* On Windows/PowerShell, use double quotes carefully; prefer storing JSON in a file and using `--data @file.json`.

[⬆ back to top](#table-of-contents)
