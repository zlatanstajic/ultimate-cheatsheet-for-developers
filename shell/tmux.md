---
last_reviewed: 2026-06-08
---

# tmux

> Terminal multiplexer for managing multiple terminal sessions, windows, and panes.

Read more about [tmux](https://github.com/tmux/tmux/wiki).

## Table of Contents

* [Sessions](#sessions)
* [Windows](#windows)
* [Panes](#panes)
* [Config & Misc](#config--misc)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Sessions

```bash
# Start a new named session
tmux new -s [name]

# Attach to an existing session by name
tmux attach -t [name]

# List all running sessions
tmux ls

# Kill a session by name
tmux kill-session -t [name]

# Detach from the current session (in-tmux keybinding): C-b d
```

[⬆ back to top](#table-of-contents)

## Windows

```bash
# Create a new window in the current session
tmux new-window

# Create a new window with a given name
tmux new-window -n [name]

# Rename the current window (in-tmux keybinding): C-b ,
# Create a new window (in-tmux keybinding): C-b c
# Switch to the next / previous window (in-tmux keybinding): C-b n / C-b p
```

[⬆ back to top](#table-of-contents)

## Panes

```bash
# Split the current pane vertically (in-tmux keybinding): C-b %
# Split the current pane horizontally (in-tmux keybinding): C-b "
# Navigate between panes (in-tmux keybinding): C-b [arrow]
# Resize the current pane (in-tmux keybinding): C-b [arrow] held
# Toggle zoom for the current pane (in-tmux keybinding): C-b z
```

[⬆ back to top](#table-of-contents)

## Config & Misc

```bash
# Reload the configuration without restarting tmux
tmux source-file ~/.tmux.conf
```

* The user configuration file lives at `~/.tmux.conf`.
* The prefix key (default `C-b`) precedes every in-tmux keybinding; it can be remapped in `~/.tmux.conf` (e.g. to `C-a`).

[⬆ back to top](#table-of-contents)

## Notes

* `C-b` means hold `Ctrl` and press `b`; release, then press the command key.
* The default prefix is `C-b`; many users remap it to `C-a` in `~/.tmux.conf` for easier reach.
* CLI commands (`tmux new`, `tmux ls`, etc.) run from the shell; keybindings like `C-b d` run from inside a tmux session.
* See the [tmux wiki](https://github.com/tmux/tmux/wiki) for the full command and keybinding reference.

[⬆ back to top](#table-of-contents)
