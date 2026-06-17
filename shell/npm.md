---
last_reviewed: 2026-03-27
tested_on: npm 10.7
---

# npm

> Default package manager for the JavaScript runtime environment Node.js.

Read more about [npm](https://www.npmjs.com/).

> Tested on: npm 10.7

## Table of Contents

* [Misc](#misc)
* [Install and Remove](#install-and-remove)
* [Globally](#globally)
* [n](#n)
* [npx](#npx)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [Node](node.md) — JavaScript runtime that npm runs on.

## Misc

```bash
# Where npm was installed
which npm

# Check the version
npm -v

# Searching for packages
npm search [package-name]

# Clean cached packages
npm cache clean --force

# Show funding information for installed packages
npm fund

# Compose security report
npm audit

# Fix security issues
npm audit fix
```

[⬆ back to top](#table-of-contents)

## Install and Remove

```bash
# Listing packages
npm list

# List outdated packages
npm outdated

# Install all dependencies from package.json
npm install

# Clean install (removes node_modules, uses package-lock.json exactly — preferred in CI)
npm ci

# Install package
npm install [package-name]

# Install package as dev dependency
npm install --save-dev [package-name]

# Update package
npm update [package-name]

# Remove package
npm remove [package-name]

# Install specific version of a package
npm install [package-name]@[version]

# Remove extraneous packages
npm prune

# Run a script defined in package.json
npm run [script-name]

# Initialize a new project (creates package.json)
npm init

# Initialize with defaults (no prompts)
npm init -y
```

[⬆ back to top](#table-of-contents)

## Globally

```bash
# Updating npm globally
npm install npm@latest -g

# List package is among globally installed packages
npm list -g | grep [package-name]

# Uninstall globally installed package
npm uninstall -g [package-name]
```

[⬆ back to top](#table-of-contents)

## n

> Node.js version manager. Read more at [n](https://www.npmjs.com/package/n).

```bash
# Install n globally
npm install -g n

# Output versions installed
n

# Install or activate the latest node release
n latest

# Install or activate the latest stable node release
n stable

# Install node [version]
n [version]

# Execute node [version] with [args ...]
n use [version] [args ...]

# Output bin path for [version]
n bin [version]

# Remove the given version(s)
n rm [version ...]

# Output the latest node version available
n --latest

# Output the latest stable node version available
n --stable

# Output the versions of node available
n ls
```

[⬆ back to top](#table-of-contents)

## npx

> Run Node.js binaries without installing them globally. Read more at [npx](https://www.npmjs.com/package/npx).

```bash
# Kill Node.js on port number
npx kill-port [port-number]
```

[⬆ back to top](#table-of-contents)
