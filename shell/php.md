# PHP

> General-purpose scripting language especially suited to web development.

Read more about [PHP](https://www.php.net/).

## Table of Contents

* [Misc](#misc)
* [Run](#run)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Misc

```bash
# Show PHP information
php -i

# Syntax check (lint)
php -l [filename]

# Show configuration file names
php --ini

# Show PHP version
php -v

# Show loaded PHP extensions
php -m

# Show defined PHP constants (all categories)
php -r "print_r(get_defined_constants(true));"
```

[⬆ back to top](#table-of-contents)

## Run

```bash
# Run with built-in web server
php -S [address]:[port]

# Parse and execute file
php -f [filename]

# Run interactively (REPL)
php -a

# Run code directly from command line
php -r "echo 'Hello, World!';"
```

[⬆ back to top](#table-of-contents)
