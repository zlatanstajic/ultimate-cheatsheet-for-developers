---
last_reviewed: 2026-06-08
---

# PHP

> General-purpose scripting language especially suited to web development.

Read more about [PHP](https://www.php.net/).

## Table of Contents

* [Misc](#misc)
* [Run](#run)
* [Server & Debug](#server--debug)
* [Modules & Info](#modules--info)
* [Server Info](#server-info)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [Composer](composer.md) — dependency manager for PHP projects.

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

## Server & Debug

```bash
# Start built-in web server with a custom document root
php -S [address]:[port] -t [docroot]

# Start built-in web server with a router script
php -S [address]:[port] [router].php

# Run a script overriding a configuration directive
php -d [directive]=[value] [filename]

# Run with errors displayed to output
php -d display_errors=1 -d error_reporting=E_ALL [filename]

# Run with a higher memory limit
php -d memory_limit=[value] [filename]

# Measure execution time of a script
time php [filename]
```

[⬆ back to top](#table-of-contents)

## Modules & Info

```bash
# Show reflection information for an extension
php --re [ext]

# Show reflection information for a function
php --rf [function]

# Show reflection information for a class
php --rc [class]

# Show information for an INI directive
php --ri [ext]

# Filter phpinfo output for a single setting
php -i | grep [setting]

# List enabled modules and filter for one
php -m | grep [ext]
```

[⬆ back to top](#table-of-contents)

## Server Info

```bash
# Test the PHP-FPM configuration for errors
php-fpm -t

# Show the PHP-FPM version
php-fpm -v

# Show compiled-in PHP-FPM modules
php-fpm -m

# Run PHP-FPM in the foreground (no daemonize)
php-fpm -F

# Test PHP-FPM config using an alternative file
php-fpm -t -y [conf]
```

[⬆ back to top](#table-of-contents)
