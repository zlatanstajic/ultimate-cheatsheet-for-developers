# Composer
> A Dependency Manager for PHP.

Read more about Composer at [getcomposer.org](https://getcomposer.org/).

## Table of Contents

* [Misc](#misc)
* [Version](#version)
* [Packages](#packages)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

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
composer create-project

# Show information about installed packages
composer info

# List installed packages that have updates available
composer outdated

# Search for packages on Packagist
composer search

# Validate composer.json and composer.lock files
composer validate

# Execute a vendored binary/script
composer exec [script]
```

[⬆ back to top](#table-of-contents)

## Version

```bash
# Show installed Composer version
composer -v

# Update Composer to the latest version
composer self-update
```

[⬆ back to top](#table-of-contents)

## Packages

```bash
# Install all dependencies listed in composer.json
composer install

# Install a specific package
composer require [vendor/package-name]

# Remove a package from the project
composer remove [vendor/package-name]

# Show which packages require the given package
composer depends [vendor/package-name]
```

[⬆ back to top](#table-of-contents)
