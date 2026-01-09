# MySQL

> Relational database management system.

Read more about [MySQL](https://www.mysql.com/).

## Table of Contents

* [Misc](#misc)
* [Databases](#databases)
* [Tables](#tables)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

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
