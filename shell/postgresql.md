# PostgreSQL

> Open source relational database management system.

Read more about [PostgreSQL](https://www.postgresql.org/).

## Table of Contents

* [Connection](#connection)
* [Database Shell](#database-shell)
* [Database Dump](#database-dump)
* [Database Restore](#database-restore)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [MySQL](mysql.md) — alternative relational database; [Docker](docker.md) — commonly run as a containerized service.

## Connection

```bash
# Connect to a database (prompts for password)
psql -U [username] -h [host] -d [database-name]

# Connect with port
psql -U [username] -h [host] -p [port] -d [database-name]

# Connect using a connection string
psql "postgresql://[username]:[password]@[host]:[port]/[database-name]"
```

[⬆ back to top](#table-of-contents)

## Database Shell

The following commands are run inside the `psql` interactive shell:

```sql
-- List all databases
\l

-- Connect to a database
\c [database-name]

-- List all tables in current schema
\dt

-- Describe a table (columns, types, constraints)
\d [table-name]

-- List all schemas
\dn

-- List all users/roles
\du

-- Show current connection info
\conninfo

-- Show query execution time
\timing

-- Execute SQL from a file
\i [path-to-file.sql]

-- Quit psql
\q
```

[⬆ back to top](#table-of-contents)

## Database Dump

```bash
# Dump to plain SQL file
pg_dump -U [username] -h [host] -d [database-name] -f [dump-filename].sql

# Dump in custom format (compressed, supports parallel restore — preferred for large databases)
pg_dump -U [username] -h [host] -Fc -d [database-name] -f [dump-filename].dump

# Dump a specific table only
pg_dump -U [username] -h [host] -d [database-name] -t [table-name] -f [dump-filename].sql

# Dump schema only (no data)
pg_dump -U [username] -h [host] -d [database-name] --schema-only -f [dump-filename].sql

# Dump data only (no schema)
pg_dump -U [username] -h [host] -d [database-name] --data-only -f [dump-filename].sql
```

[⬆ back to top](#table-of-contents)

## Database Restore

```bash
# Restore from plain SQL dump
psql -U [username] -h [host] -d [database-name] < [path-to-dump-file].sql

# Restore from custom format dump (use pg_restore)
pg_restore -U [username] -h [host] -d [database-name] [path-to-dump-file].dump

# Restore with parallel jobs (faster for large databases)
pg_restore -U [username] -h [host] -d [database-name] -j [num-jobs] [path-to-dump-file].dump
```

[⬆ back to top](#table-of-contents)
