---
last_reviewed: 2026-06-08
---

# SSH

> Secure remote login and command execution over an encrypted network connection.

Read more about [SSH](https://www.openssh.com/).

## Table of Contents

* [Connect](#connect)
* [Keys](#keys)
* [Tunnels](#tunnels)
* [Config & Files](#config--files)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Connect

```bash
# Connect to a host as a given user
ssh [user]@[host]

# Connect on a non-default port
ssh -p [port] [user]@[host]

# Connect using a specific private key (identity file)
ssh -i [identity_file] [user]@[host]

# Specify the login user with -l instead of user@host
ssh -l [user] [host]

# Run a single command on the remote host and exit
ssh [user]@[host] '[command]'
```

[⬆ back to top](#table-of-contents)

## Keys

```bash
# Generate a new ed25519 key pair with a descriptive comment
ssh-keygen -t ed25519 -C [comment]

# Copy your public key to a remote host's authorized_keys
ssh-copy-id [user]@[host]

# Add a private key to the running ssh-agent
ssh-add [key]

# List identities currently loaded in the agent
ssh-add -l
```

[⬆ back to top](#table-of-contents)

## Tunnels

```bash
# Local port forward: forward local port to host:remote via the SSH server
ssh -L [local]:[host]:[remote] [user]@[host]

# Remote port forward: expose a local service on the remote side
ssh -R [remote]:[host]:[local] [user]@[host]

# Dynamic SOCKS proxy on a local port
ssh -D [port] [user]@[host]

# Set up forwarding without running a remote command, in the background
ssh -N -f -L [local]:[host]:[remote] [user]@[host]
```

[⬆ back to top](#table-of-contents)

## Config & Files

```bash
# Define a reusable host block in ~/.ssh/config
# Host [alias]
#   HostName [host]
#   User [user]
#   Port [port]
#   IdentityFile [identity_file]

# Remote host fingerprints are recorded in ~/.ssh/known_hosts
# Authorized public keys live in ~/.ssh/authorized_keys on the server

# Fetch a host's public key for known_hosts
ssh-keyscan [host] >> ~/.ssh/known_hosts
```

[⬆ back to top](#table-of-contents)

## Notes

* Prefer `ed25519` keys over RSA — they are smaller, faster, and offer strong security by default.
* Use agent forwarding (`-A`) sparingly; a compromised intermediate host can hijack your forwarded agent.
* Verify host-key fingerprints on first connection to guard against man-in-the-middle attacks; never blindly accept unknown keys.
* Restrict key files to `chmod 600` and the `~/.ssh` directory to `700`, or the client will refuse to use them.
* See the [OpenSSH manual](https://man.openbsd.org/ssh) for the full set of options and configuration directives.

[⬆ back to top](#table-of-contents)
