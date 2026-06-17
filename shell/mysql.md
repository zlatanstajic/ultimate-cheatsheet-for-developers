---
last_reviewed: 2026-03-27
---

# MySQL

> Relational database management system.

Read more about [MySQL](https://www.mysql.com/).

## Table of Contents

* [Misc](#misc)
* [Databases](#databases)
* [Tables](#tables)
* [SQL Templates](#sql-templates)
* [Safety Toggles](#safety-toggles)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [PostgreSQL](postgresql.md) — alternative open-source relational database; [Docker](docker.md) — commonly run as a containerized service.

## Misc

```bash
# Login to MySQL
mysql -u [username] -p

# Get help inside MySQL shell
help;

# Get status information from the server
status;

# Logout from MySQL shell
exit;
```

[⬆ back to top](#table-of-contents)

## Databases

```bash
# Show all databases
show databases;

# Create a new database
create database [database-name];

# Select a database to use
use [database-name];

# Get the name of the currently used database
select database();

# Export database dump (run outside MySQL shell)
mysqldump -u [username] -p [database-name] > [filename].sql

# Import database dump (run outside MySQL shell)
mysql -u [username] -p [database-name] < [filename].sql

# Delete a database
drop database [database-name];
```

[⬆ back to top](#table-of-contents)

## Tables

```bash
# Show all tables in the current database
show tables;

# Show table structure
describe [table-name];

# Show indexes on a table
show index from [table-name];

# Create a new table (example)
create table [table-name] (
    id int auto_increment primary key,
    name varchar(255) not null
);

# Delete a table
drop table [table-name];
```

[⬆ back to top](#table-of-contents)

## SQL Templates

```sql
-- Quick select with dynamic filter base (append AND clauses)
SELECT x.*
FROM table_name AS x
WHERE 1=1
ORDER BY x.id DESC
LIMIT 10;

-- Show create table syntax
SHOW CREATE TABLE table_name;

-- Insert template
INSERT INTO table_name (column1, column2)
VALUES ('value1', 'value2');

-- Update template
UPDATE table_name
SET column1 = 'value1'
WHERE id = 1;

-- Delete template (WHERE 1=1 base allows safe step-by-step filter building)
DELETE FROM table_name
WHERE id = 1;
```

[⬆ back to top](#table-of-contents)

## Safety Toggles

```sql
-- Disable safe mode for bulk operations
SET SQL_SAFE_UPDATES = 0;

-- Enable safe mode
SET SQL_SAFE_UPDATES = 1;

-- Disable foreign key constraint checks
SET FOREIGN_KEY_CHECKS = 0;

-- Enable foreign key constraint checks
SET FOREIGN_KEY_CHECKS = 1;
```

[⬆ back to top](#table-of-contents)
