# Git Crypt

> Transparent file encryption for version control with git-crypt.

Read more about [git-crypt](https://github.com/AGWA/git-crypt) and [managing secrets](https://dev.to/heroku/how-to-manage-your-secrets-with-git-crypt-56ih).

## Table of Contents

* [Git Crypt Operations](#git-crypt-operations)
* [GPG Keys](#gpg-keys)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Git Crypt Operations

```bash
# Show help
git-crypt help

# Initialize git-crypt in a repository (run once, before any commits)
git-crypt init

# Grant access to a GPG user (by key ID or email)
git-crypt add-gpg-user [key-id|email]

# Unlock repository using your GPG key
git-crypt unlock

# Unlock repository using a symmetric key file (e.g. in CI)
git-crypt unlock [path-to-symmetric-key]

# Lock repository
git-crypt lock

# Show encryption status of all tracked files
git-crypt status

# Show only encrypted files
git-crypt status -e

# Show only unencrypted files
git-crypt status -u

# Export the symmetric key for backup or CI use (store securely)
git-crypt export-key [output-path]
```

#### .gitattributes

Define which files get encrypted by adding patterns to `.gitattributes`:

```gitattributes
# Encrypt all .env files
.env filter=git-crypt diff=git-crypt

# Encrypt everything under secrets/
secrets/** filter=git-crypt diff=git-crypt
```

> Git-crypt only encrypts files matching these patterns. Commit `.gitattributes` to the repository.

[⬆ back to top](#table-of-contents)

## GPG Keys

```bash
# Generate a new GPG key (interactive, recommended)
gpg --full-generate-key

# List all public keys
gpg --list-keys

# List all private keys
gpg --list-secret-keys

# Show key fingerprint
gpg --fingerprint [key-id]

# Export public key (armored ASCII)
gpg --export --armor [key-id] > [output-file-path]

# Export private key (armored ASCII — store securely, never commit)
gpg --export-secret-keys --armor [key-id] > [output-file-path]

# Import a key (public or private)
gpg --import [path-to-key-file]

# Delete a public key
gpg --delete-key [key-id]

# Delete a private key (required before deleting the public key)
gpg --delete-secret-key [key-id]
```

[⬆ back to top](#table-of-contents)

## Notes

- **Initialize before committing secrets**: run `git-crypt init` and configure `.gitattributes` before adding any sensitive files.
- **`export-key` is a symmetric master key**: anyone with this file can decrypt the repository. Store it in a secrets manager (e.g. 1Password, Vault), never in the repo.
- **Private key export**: treat exported private GPG keys like passwords — encrypt the file at rest and transfer over a secure channel only.
- **CI/CD**: unlock in CI using the exported symmetric key stored as a secret environment variable:

  ```bash
  echo "$GIT_CRYPT_KEY" | base64 -d > /tmp/git-crypt-key
  git-crypt unlock /tmp/git-crypt-key
  rm /tmp/git-crypt-key
  ```

- **Re-encryption**: removing a user does not re-encrypt history. Rotate secrets if a key is compromised.

[⬆ back to top](#table-of-contents)
