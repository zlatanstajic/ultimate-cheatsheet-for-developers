# Redis

> In-memory data structure store for caching and data management.

Read more about [Redis](https://redis.io/).

## Table of Contents

* [Connection](#connection)
* [Keys](#keys)
* [Strings](#strings)
* [Hashes](#hashes)
* [Expiration](#expiration)
* [Server](#server)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Connection

```bash
# Connect to local Redis instance
redis-cli

# Connect to a remote Redis instance
redis-cli -h [host] -p [port]

# Connect with authentication
redis-cli -h [host] -p [port] -a [password]

# Test connection
redis-cli ping
```

[⬆ back to top](#table-of-contents)

## Keys

The following commands are run inside the `redis-cli` shell:

```bash
# Authenticate (if password is set)
AUTH [password]

# List all keys (avoid in production on large datasets)
KEYS *

# List keys matching a pattern
KEYS [pattern]

# Check if a key exists
EXISTS [key]

# Get the type of a key
TYPE [key]

# Rename a key
RENAME [key] [new-key]

# Delete a key
DEL [key]

# Delete multiple keys
DEL [key1] [key2] [key3]
```

[⬆ back to top](#table-of-contents)

## Strings

```bash
# Set a key-value pair
SET [key] [value]

# Get a value by key
GET [key]

# Set a key with expiration (seconds)
SETEX [key] [seconds] [value]

# Increment an integer value
INCR [key]

# Append to a string value
APPEND [key] [value]
```

[⬆ back to top](#table-of-contents)

## Hashes

```bash
# Set a field in a hash
HSET [key] [field] [value]

# Get a field from a hash
HGET [key] [field]

# Get all fields and values from a hash
HGETALL [key]

# Delete a field from a hash
HDEL [key] [field]
```

[⬆ back to top](#table-of-contents)

## Expiration

```bash
# Get time to live for a key (in seconds; -1 = no expiry, -2 = key not found)
TTL [key]

# Set expiration on an existing key (seconds)
EXPIRE [key] [seconds]

# Remove expiration from a key
PERSIST [key]
```

[⬆ back to top](#table-of-contents)

## Server

```bash
# Show server information and statistics
INFO

# Delete all keys in the current database
FLUSHDB

# Delete all keys in all databases (use with caution)
FLUSHALL

# Get number of keys in current database
DBSIZE

# Save the dataset to disk
BGSAVE
```

[⬆ back to top](#table-of-contents)
