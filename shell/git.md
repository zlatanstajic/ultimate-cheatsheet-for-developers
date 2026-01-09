# Git

> Version-control system for tracking changes in source code during software development.

Read more about [Git](https://git-scm.com/).

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

## Misc

```bash
# Access configuration
nano ~/.gitconfig

# Get version
git version

# Initialize repository
git init

# Set credentials for repository
git config credential.helper store

# Clone repository
git clone [repository-url]

# Get differences between files
git diff --staged

# Reset changes to the file
git checkout HEAD -- [filename]

# Restore changes to directory
git restore -s@ -SW  -- [directory]

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
git stash pop stash@{n}

# Only apply previously stashed working changes
git stash apply stash@{n}

# Clear all stashed working changes
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

# Remove files from stage area
git rm --cached [filename]

# Reset changes to the last commit
git reset --hard

# Reset changes to the specific commit
git reset --hard [commit-hash]

# Delete last n commits and force push to remote origin
git reset --hard HEAD~[n]
git push -f

# Undo specific commit
git checkout [commit-hash]

# Rename last commit message
git commit --amend -m "[message-content]"
git push --force [branch-name]

# Set commit date a few days in the past
git commit -m "[message-content]" --date="[number-of-days] day ago"

# Revert all commits (including initial)
git update-ref -d HEAD

# Number of commits for branch name
git rev-list --count [branch-name]

# Number of commits across all branches
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
git branch

# List all branches
git branch -a

# List all remote branches
git branch -r

# Switch to branch
git checkout [branch-name]

# Create branch
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
git branch -vv | awk '/: gone]/{print $1}'

# Delete all branches locally which are gone on remote
git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -d
```

[⬆ back to top](#table-of-contents)

## Users

```bash
# Get global user
git config --global --list

# Set global user
git config --global user.name  "[username]"
git config --global user.email "[email]"

# Check global config
git config --list

# Set local user
git config user.name "[username]"
git config user.email "[email]"

# Check local config
git config --local --list

```

[⬆ back to top](#table-of-contents)

## Remote

```bash
# Get remote version
git remote -v

# Set remote origin URL
git remote set-url origin [url-path]

# Change directory and remote path
git remote set-url --add origin [url-path]

# Edit remote location
git remote -v
git remote rm origin
git remote add origin [url-path]
git push --set-upstream origin [branch-name]

# Prune all unreachable objects from the remote object database
git remote prune origin
```

[⬆ back to top](#table-of-contents)

## Repository

```bash
# Create a new repository
git init
git add *
git commit -m "[message-content]"
git branch -M [master|main]
git remote add origin git@github.com:[vendor-name]/[repository-name].git
git push -u origin [master|main]

# Push to existing repository
git remote add origin git@github.com:[vendor-name]/[repository-name].git
git branch -M [master|main]
git push -u origin [master|main]
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

# prune-list: List what should be pruned locally and remotely
!git remote prune origin -n && git prune -n

# prune-now: Prune locally and remotely
!git remote prune origin && git prune

# gone-list: List branches which can be removed locally
!git branch -vv | awk '/: gone]/{print $1}'

# gone-now: Remove branches locally
!git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D
```

### Setting Alias

Use the *Set alias* command above to set a certain alias.
Give a name to the alias and paste the command of your choice.
Here's an example of how to set the `prune-list` alias:

```bash
git config --global alias.prune-list "!git remote prune origin -n && git prune -n"
```

You can also set aliases directly inside your `.gitconfig` file, located in your home directory:

```bash
# Open .gitconfig file in terminal
nano ~/.gitconfig
```

Add or update the `[alias]` section (only if not already present) and add your alias (here is `prune-list` as an example):

```
[user]
    email = [your-email]
    name = [your-name]
[alias]
    prune-list = !git remote prune origin -n && git prune -n
```

[⬆ back to top](#table-of-contents)
