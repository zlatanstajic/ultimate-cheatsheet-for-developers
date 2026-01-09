# npm

> Default package manager for the JavaScript runtime environment Node.js.

Read more about [npm](https://www.npmjs.com/).

## Table of Contents

* [Misc](#misc)
* [Install and Remove](#install-and-remove)
* [Globally](#globally)
* [n](#n)
* [npx](#npx)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

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

# Get details of node_modules directory
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

# Install package
npm install [package-name]

# Update package
npm update [package-name]

# Remove package
npm remove [package-name]

# Install specific version of a package
npm install [package-name]@[version]

# Remove extraneous packages
npm prune
```

[⬆ back to top](#table-of-contents)

## Globally

```bash
# Updating npm globally
npm install npm@latest -g

# List package is among globally installed packages
npm list -g | grep [package-name]

# Uninstall globally installed package
npm uninstall -g [package-name] --save
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
