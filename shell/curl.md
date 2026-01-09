# cURL

> Command line tool and library for transferring data with URLs.

Read more about cURL at [curl.haxx.se](https://curl.haxx.se/).

## Table of Contents

* [Misc](#misc)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Misc

```bash
# Get HTTP headers for a URL
curl -I [url]

# Get page content
curl [url]

# Download to file
curl -o [file] [url]

# Resume download
curl -L -O -C - [url]

# Send a GET request with basic authentication and pretty-print JSON response
curl -u [username]:[password] [url] | json_pp

# Post JSON data with authentication
curl -u [username]:[password] -H "Content-Type: application/json" -d '[json-data]' -X POST [url]

# Get HTTP status code only
curl -LI [url] -o /dev/null -w "%{http_code}\n" -s
```

[⬆ back to top](#table-of-contents)
