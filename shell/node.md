---
last_reviewed: 2026-06-08
tested_on: Node 22.2
---

# Node

> JavaScript runtime built on Chrome's V8 JavaScript engine.

Read more about [Node](https://nodejs.org/).

> Tested on: Node 22.2

## Table of Contents

* [Inspect & Debug](#inspect--debug)
* [Run Modes](#run-modes)
* [REPL & Eval](#repl--eval)
* [Misc](#misc)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [npm](npm.md) — package manager for Node.js.

## Inspect & Debug

```bash
# Start the inspector and run a script (connect via chrome://inspect)
node --inspect [filename.js]

# Listen on a custom host and port for the inspector
node --inspect=[host]:[port] [filename.js]

# Break on the first line so a debugger can attach before code runs
node --inspect-brk [filename.js]

# Run the built-in command-line debugger
node inspect [filename.js]

# Generate a V8 CPU profile (writes an isolate-*.log file)
node --prof [filename.js]

# Turn the V8 profiler log into a readable report
node --prof-process [isolate-log-file] > [report.txt]

# Print a heap snapshot when a signal is received
node --heapsnapshot-signal=SIGUSR2 [filename.js]
```

[⬆ back to top](#table-of-contents)

## Run Modes

```bash
# Re-run the entry file whenever a watched file changes
node --watch [filename.js]

# Restrict the watcher to a specific path
node --watch-path=[dir] [filename.js]

# Load environment variables from a file before running
node --env-file=[.env] [filename.js]

# Run an ES module explicitly
node [filename.mjs]

# Treat a .js file as ES module syntax
node --input-type=module [filename.js]

# Run TypeScript by stripping types (experimental)
node --experimental-strip-types [filename.ts]

# Enable the experimental built-in test runner
node --test

# Filter the test runner to matching test names
node --test --test-name-pattern=[pattern]
```

[⬆ back to top](#table-of-contents)

## REPL & Eval

```bash
# Evaluate an expression and print nothing unless you log
node -e "[code]"

# Evaluate an expression and auto-print the result
node -p "[expression]"

# Chain multiple statements in a single eval
node -e "const os = require('os'); console.log(os.platform())"

# Require a module from the CLI before running a script
node -r [module] [filename.js]

# Preload a module into the REPL session
node -r [module]

# Pipe code into Node via stdin
echo "[code]" | node

# Print the resolved path of a required module
node -p "require.resolve('[module]')"
```

[⬆ back to top](#table-of-contents)

## Misc

```bash
# Show Node.js version
node -v

# Show Node.js version (alternative)
node --version

# Syntax check (lint)
node -c [path-to-the-file]

# Start a REPL (interactive shell)
node

# Run a JavaScript file
node [filename.js]

# Print process info
node -p "process"

# Evaluate JavaScript expression from command line
node -e "console.log('Hello, Node!')"
```

[⬆ back to top](#table-of-contents)
