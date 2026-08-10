# Ultimate Cheatsheet for Developers

![freshness](https://img.shields.io/endpoint?url=https://zlatanstajic.github.io/ultimate-cheatsheet-for-developers/assets/freshness-badge.json)

> Making everyday development easier.

A curated collection of tips, commands, and resources to speed up and simplify your web development workflow.

## CLI

Read any cheatsheet section straight from your terminal with the `ucheat` npm package:

```bash
# Render a section (fuzzy-matched, so "git stsh" works too)
npx ucheat git stash

# List the sections of a tool's cheatsheet
npx ucheat docker

# Show usage and the list of available tools
npx ucheat --help
```

## Table of Contents

🔍 [Search](search.html) — search across all cheatsheets and jump to the matching section.

### 📚 Knowledgebase

|Name|Description|
|---|---|
|🐙 [GitHub Repos](knowledgebase/github-repos.md)|Curated list of useful GitHub repositories for web development.|
|📚 [Learning Sources](knowledgebase/learning-sources.md)|Useful learning sources and documentation for web development.|
|🛠️ [Web Development Tools](knowledgebase/web-development-tools.md)|Handy tools and utilities for web developers.|
|📖 [Books To Read](knowledgebase/books-to-read.md)|Recommended books for software developers.|
|🐧 [Linux Apps](knowledgebase/linux-apps.md)|Recommended Linux applications for developers.|

### 💻 Shell

|Name|Description|
|---|---|
|📦 [Composer](shell/composer.md)|Dependency management for PHP projects.|
|🌐 [cURL](shell/curl.md)|Command-line tool for transferring data with URLs.|
|🔀 [Git](shell/git.md)|Version control system for tracking code changes.|
|🔐 [Git Crypt](shell/git-crypt.md)|Transparent file encryption for version control.|
|🐧 [Linux](shell/linux.md)|Useful Linux commands and tips.|
|🗄️ [MySQL](shell/mysql.md)|Commands for MySQL database management.|
|🐘 [PostgreSQL](shell/postgresql.md)|PostgreSQL relational database management.|
|🟢 [Node](shell/node.md)|Node.js runtime and command-line usage.|
|📀 [npm](shell/npm.md)|Node.js package manager commands.|
|🐍 [Python](shell/python.md)|Python programming language and package management.|
|🐳 [Docker](shell/docker.md)|Container platform for building and running applications.|
|💾 [Redis](shell/redis.md)|In-memory data structure store for caching and data management.|
|🔷 [PHP](shell/php.md)|PHP command-line usage and scripting.|
|🔑 [SSH](shell/ssh.md)|Secure remote login and command execution.|
|🧮 [jq](shell/jq.md)|Command-line JSON processor.|
|🪟 [tmux](shell/tmux.md)|Terminal multiplexer for sessions, windows, and panes.|
|⚙️ [systemctl](shell/systemctl.md)|Control the systemd system and service manager.|

## Inspiration

The goal of this repository is to make the daily web development process faster and easier by providing quick access to essential knowledge and tools.

## Contribution

[Contributions](CONTRIBUTING.md) are welcome! Feel free to open issues or submit pull requests to improve this project.

## Running tests

To run tests locally:

```bash
npm install
npm test
```

This runs markdownlint, markdown-link-check, and cspell against the repository Markdown files.

## Exports

To take the cheatsheets offline, generate export artifacts locally:

```bash
npm run build:print     # print-optimized HTML pages in dist/print/
npm run build:snippets  # VS Code snippet bundle in dist/snippets/cheatsheets.code-snippets
npm run build:export    # both of the above
```

Output lands in the git-ignored `dist/` folder. Open any page from `dist/print/` in a browser and use "Print to PDF" for a clean paper copy (one card per section). Import `cheatsheets.code-snippets` into VS Code (place it in your snippets folder) to get the shell commands as editor snippets.

## Contributors

Generated from `git shortlog` — regenerate with `npm run leaderboard`.

<!-- CONTRIBUTORS:START -->
1. **Zlatan Stajic** — 13 commits
<!-- CONTRIBUTORS:END -->

## License

This project is licensed under the [MIT License](LICENSE.md).
