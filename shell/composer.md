---
last_reviewed: 2026-03-27
---

# Composer

> A Dependency Manager for PHP.

Read more about [Composer](https://getcomposer.org/).

## Table of Contents

* [Misc](#misc)
* [Version](#version)
* [Packages](#packages)
* [Global](#global)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [PHP](php.md) — language runtime Composer is built for.

## Misc

```bash
# Initialize composer in your project
composer init

# List all available Composer commands
composer list

# Update all dependencies to the latest versions
composer update

# Regenerate the autoload files
composer dump-autoload

# Open the package's repository URL or homepage in your browser
composer browse

# Clear Composer's internal package cache
composer clear-cache

# Create a new project from a package into a given directory
composer create-project [vendor/package-name] [directory]
# composer create-project laravel/laravel my-app
# composer create-project symfony/skeleton my-app

# Show information about all installed packages
composer show

# Show information about a specific package
composer show [vendor/package-name]

# List installed packages that have updates available
composer outdated

# Search for packages on Packagist
composer search

# Validate composer.json and composer.lock files
composer validate

# Execute a vendored binary/script
composer exec [script]

# Run a script defined in composer.json
composer run [script]
```

[⬆ back to top](#table-of-contents)

## Version

```bash
# Show installed Composer version
composer -V

# Update Composer to the latest stable version
composer self-update

# Pin to a specific major version (v2 or v3)
composer self-update --2
composer self-update --3
```

[⬆ back to top](#table-of-contents)

## Packages

```bash
# Install all dependencies listed in composer.json
composer install

# Install dependencies for production (skip dev dependencies)
composer install --no-dev

# Install a specific package
composer require [vendor/package-name]

# Install a package as a dev dependency
composer require --dev [vendor/package-name]

# Remove a package from the project
composer remove [vendor/package-name]

# Show which packages require the given package
composer depends [vendor/package-name]
```

[⬆ back to top](#table-of-contents)

## Global

```bash
# Install a package globally
composer global require [vendor/package-name]

# List globally installed packages
composer global show

# Update all globally installed packages
composer global update

# Remove a globally installed package
composer global remove [vendor/package-name]
```

[⬆ back to top](#table-of-contents)
