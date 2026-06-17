---
last_reviewed: 2026-06-08
---

# jq

> Lightweight command-line JSON processor.

Read more about [jq](https://jqlang.github.io/jq/).

## Table of Contents

* [Basics](#basics)
* [Filter & Select](#filter--select)
* [Transform](#transform)
* [Format & Flags](#format--flags)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Basics

```bash
# Identity filter — pretty-print the whole input
jq '.' [file.json]

# Access a single field by key
jq '.[key]' [file.json]

# Access an array element by index
jq '.[index]' [file.json]

# Iterate over all elements of an array
jq '.[]' [file.json]

# Pipe one filter into the next (extract a field from each element)
jq '.[] | .[key]' [file.json]
```

[⬆ back to top](#table-of-contents)

## Filter & Select

```bash
# Keep only elements matching a condition
jq '.users[] | select(.active)' [file.json]

# Filter by a field comparison
jq '.items[] | select(.price > 100)' [file.json]

# Transform every element of an array
jq 'map(.name)' [file.json]

# Keep objects that contain a given key
jq '.[] | select(has("email"))' [file.json]
```

[⬆ back to top](#table-of-contents)

## Transform

```bash
# Build a new object from selected fields
jq '{name: .name, id: .id}' [file.json]

# Convert an object into an array of key/value pairs
jq 'to_entries' [file.json]

# List the keys of an object
jq 'keys' [file.json]

# Count elements of an array (or keys of an object)
jq 'length' [file.json]
```

[⬆ back to top](#table-of-contents)

## Format & Flags

```bash
# Raw output — strip surrounding quotes from strings (-r)
jq -r '.name' [file.json]

# Compact output — one JSON value per line, no pretty-printing (-c)
jq -c '.[]' [file.json]

# Sort object keys in the output (-S)
jq -S '.' [file.json]

# Inject a shell string as a jq variable (--arg)
jq --arg name '[value]' '.users[] | select(.name == $name)' [file.json]

# Inject typed JSON (number, bool, object) as a variable (--argjson)
jq --argjson min 100 '.items[] | select(.price >= $min)' [file.json]
```

[⬆ back to top](#table-of-contents)

## Notes

* Pairs naturally with [`cURL`](curl.md): pipe an API response straight into jq, e.g. `curl -s [url] | jq .`.
* Use `-r` when feeding jq output into other shell commands so values are not wrapped in quotes.
* Prefer `--arg` / `--argjson` over string interpolation to avoid quoting bugs and injection.
* See the [jq manual](https://jqlang.github.io/jq/manual/) for the full filter language reference.

[⬆ back to top](#table-of-contents)
