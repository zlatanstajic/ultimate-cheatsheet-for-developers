---
last_reviewed: 2026-10-08
tested_on:
  - git 2.43
  - git 2.44
---

# Git

> Version-control system for tracking changes in source code during software development.

Read more about [Git](https://git-scm.com/).

> Tested on: git 2.43

## Table of Contents

* [Misc](#misc)
* [Stash](#stash)
* [Commits](#commits)
* [Tags](#tags)
* [Branches](#branches)
* [Users](#users)
* [Remote](#remote)
* [Repository](#repository)
* [Alias](#alias)
  * [Example Alias Commands](#example-alias-commands)
  * [Setting Alias](#setting-alias)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [Git Crypt](git-crypt.md) — transparent file encryption for git repositories.

## Misc

```bash
# Access configuration
nano ~/.gitconfig

# Get version
git version

# Initialize repository
git init

# Save credentials in plaintext to ~/.git-credentials, shared by all repositories (use a credential manager in production)
git config credential.helper store

# Clone repository
git clone [repository-url]

# Show staged changes (index vs. last commit)
git diff --staged

# Discard staged and unstaged changes to the file (⚠️ destructive — uncommitted changes are lost)
git checkout HEAD -- [filename]

# Discard staged and unstaged changes in a directory (⚠️ destructive — uncommitted changes are lost)
git restore -s@ -SW -- [directory]

# Count unpacked number of objects and their disk consumption
git count-objects -v
```

[⬆ back to top](#table-of-contents)

## Stash

```bash
# List all stashed changes
git stash list

# Save working changes to stash
git stash push -m "[message-content]"

# Pop and apply previously stashed working changes
git stash pop stash@{[n]}

# Only apply previously stashed working changes
git stash apply stash@{[n]}

# Delete all stash entries (⚠️ destructive — may be impossible to recover)
git stash clear
```

[⬆ back to top](#table-of-contents)

## Commits

```bash
# Check commits short log
git shortlog

# Get last n commits
git log -n [number-of-commits]

# Get last n commits in one line
git log -n [number-of-commits] --oneline

# Get last n commits by author
git log -n [number-of-commits] --author=[author-name]

# Stop tracking a file while keeping the working copy (stages its deletion)
git rm --cached [filename]

# Discard all uncommitted changes to tracked files (⚠️ destructive — cannot be undone)
git reset --hard

# Move the branch to a specific commit (⚠️ destructive — discards later commits and uncommitted changes)
git reset --hard [commit-hash]

# Delete last n commits and force push to remote origin
git reset --hard HEAD~[n]
git push -f

# Push commits bypassing the local pre-push hook (use with caution — skips the checks the hook runs; server-side CI still runs)
git push --no-verify

# Inspect a specific commit (results in detached HEAD — create a branch to keep changes)
git checkout [commit-hash]

# Rename last commit message
git commit --amend -m "[message-content]"
# Prefer --force-with-lease over --force to avoid overwriting others' pushed commits
git push --force-with-lease origin [branch-name]

# Set author date a few days in the past (committer date stays current)
git commit -m "[message-content]" --date="[number-of-days] day ago"

# Delete the current branch's entire history, keeping files staged (⚠️ destructive — commits become unreachable)
git update-ref -d HEAD

# Number of commits for branch name
git rev-list --count [branch-name]

# Number of commits reachable from all refs (including branches and tags) and HEAD
git rev-list --all --count
```

[⬆ back to top](#table-of-contents)

## Tags

```bash
# Delete a local tag
git tag -d [tag-name]

# Remove tags remotely
git push origin :refs/tags/[tag-name]

# Tags to branches
git checkout tags/[tag-name] -b [branch-name]

# Tag older commit
git tag -a [version-number] [commit-number] -m "[tag-message]"
git push origin [version-number]
```

[⬆ back to top](#table-of-contents)

## Branches

```bash
# Show current branch
git branch --show-current

# List all branches
git branch -a

# List all remote branches
git branch -r

# Switch to branch
git switch [branch-name]

# Create and switch to a new branch
git switch -c [branch-name]

# Create branch (without switching)
git branch [branch-name]

# Clone branch
git clone --branch [branch-name] [repository-url]

# Rename branch (locally)
git branch -m [old-name] [new-name]

# Delete branch (locally)
git branch -d [branch-name]

# Delete branch (remotely)
git push origin -d [branch-name]

# Set specific branch for pushed commits
git push --set-upstream origin [branch-name]

# Merge certain branch to current branch
git merge [branch-name]

# Get all merged branches
git branch --merged

# Get all non-merged branches
git branch --no-merged

# List all branches in local which are gone on remote
git branch --format='%(refname:short) %(upstream:track)' | awk '$2 ~ /gone]/ {print $1}'

# Delete all branches locally which are gone on remote
git branch --format='%(refname:short) %(upstream:track)' | awk '$2 ~ /gone]/ {print $1}' | xargs -r git branch -d
```

[⬆ back to top](#table-of-contents)

## Users

```bash
# Get global user
git config --global user.name
git config --global user.email

# Set global user
git config --global user.name  "[username]"
git config --global user.email "[email]"

# Check global config
git config --global --list

# Set local user
git config user.name "[username]"
git config user.email "[email]"

# Check local config
git config --local --list

```

[⬆ back to top](#table-of-contents)

## Remote

```bash
# List remotes with their URLs
git remote -v

# Set remote origin URL
git remote set-url origin [url-path]

# Add a second URL to origin (pushes go to every URL; fetches use only the first)
git remote set-url --add origin [url-path]

# Edit remote location
git remote -v
git remote rm origin
git remote add origin [url-path]
git push --set-upstream origin [branch-name]

# Delete stale remote-tracking branches (origin/* refs whose branch no longer exists on the remote)
git remote prune origin
```

[⬆ back to top](#table-of-contents)

## Repository

```bash
# Create a new repository
git init
git add .
git commit -m "[message-content]"
git branch -M [master|main]
git remote add origin git@github.com:[vendor-name]/[repository-name].git
git push -u origin [master|main]

# Push to existing repository
git remote add origin git@github.com:[vendor-name]/[repository-name].git
git branch -M [master|main]
git push -u origin [master|main]

# Replace master with a clean orphan branch (⚠️ destructive — rewrites history)
git checkout --orphan new-master
git add .
git commit -m "[message-content]"
git branch -D master
git branch -m new-master master
git push -f origin master
```

[⬆ back to top](#table-of-contents)

## Alias

```bash
# List all aliases
git config --get-regexp alias

# Set alias
git config --global alias.[alias-name] "[command]"

# Remove specific alias
git config --global --unset alias.[alias-name]
```

### Example Alias Commands

```bash
# log-list: Log last two changes, current status and branch
!git log -n 2 && echo '' && echo '' && git status && echo '' && git branch

# prune-list: List stale remote-tracking branches and unreachable loose objects (dry run)
!git remote prune origin -n && git prune -n

# prune-now: Delete stale remote-tracking branches and unreachable loose objects (⚠️ destructive — git prune permanently deletes dropped stashes and orphaned commits)
!git remote prune origin && git prune

# gone-list: List branches which can be removed locally
!git branch --format='%(refname:short) %(upstream:track)' | awk '$2 ~ /gone]/ {print $1}'

# gone-now: Force-delete local branches whose remote is gone (⚠️ destructive — -D also deletes unmerged branches)
!git branch --format='%(refname:short) %(upstream:track)' | awk '$2 ~ /gone]/ {print $1}' | xargs -r git branch -D
```

### Setting Alias

Use the *Set alias* command above to set a certain alias.
Give a name to the alias and paste the command of your choice.
Here's an example of how to set the `prune-list` alias:

```bash
git config --global alias.prune-list '!git remote prune origin -n && git prune -n'
```

You can also set aliases directly inside your `.gitconfig` file, located in your home directory:

```bash
# Open .gitconfig file in terminal
nano ~/.gitconfig
```

Add or update the `[alias]` section (only if not already present) and add your alias (here is `prune-list` as an example):

```text
[user]
    email = [your-email]
    name = [your-name]
[alias]
    prune-list = !git remote prune origin -n && git prune -n
```

[⬆ back to top](#table-of-contents)
