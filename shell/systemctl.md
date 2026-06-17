---
last_reviewed: 2026-06-08
---

# systemctl

> Control the systemd system and service manager.

Read more about [systemctl](https://www.freedesktop.org/wiki/Software/systemd/).

## Table of Contents

* [Services](#services)
* [Inspect](#inspect)
* [Logs](#logs)
* [System State](#system-state)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Services

```bash
# Start a service
sudo systemctl start [unit]

# Stop a service
sudo systemctl stop [unit]

# Restart a service (stop then start)
sudo systemctl restart [unit]

# Reload a service config without a full restart
sudo systemctl reload [unit]

# Show current status and recent log lines for a unit
systemctl status [unit]

# Enable a service to start on boot
sudo systemctl enable [unit]

# Disable a service from starting on boot
sudo systemctl disable [unit]

# Check whether a unit is currently running
systemctl is-active [unit]

# Check whether a unit is enabled at boot
systemctl is-enabled [unit]
```

[⬆ back to top](#table-of-contents)

## Inspect

```bash
# List loaded units that are active
systemctl list-units

# List installed unit files and their enablement state
systemctl list-unit-files

# Show only units that have failed
systemctl --failed

# Print the unit file contents for a unit
systemctl cat [unit]
```

[⬆ back to top](#table-of-contents)

## Logs

```bash
# Show logs for a specific unit
journalctl -u [unit]

# Follow a unit's logs in real time
journalctl -u [unit] -f

# Show logs since a given time (e.g. "1 hour ago" or "2026-06-08")
journalctl -u [unit] --since "[time]"

# Show logs from the current boot only
journalctl -u [unit] -b
```

[⬆ back to top](#table-of-contents)

## System State

```bash
# Reload systemd manager config after editing unit files
sudo systemctl daemon-reload

# Reboot the machine (this ends all sessions — use with care)
sudo systemctl reboot

# Power off the machine (this shuts everything down — use with care)
sudo systemctl poweroff

# Operate on the calling user's service manager instead of the system one
systemctl --user status
```

[⬆ back to top](#table-of-contents)

## Notes

* System units require `sudo`; user units managed with `systemctl --user` run under your own session and do not.
* User units live under `~/.config/systemd/user/` and only run while you are logged in (unless lingering is enabled).
* Run `systemctl daemon-reload` after creating or editing a unit file so systemd picks up the changes.
* See the [systemd docs](https://www.freedesktop.org/wiki/Software/systemd/) and the [`systemctl(1)` man page](https://man7.org/linux/man-pages/man1/systemctl.1.html) for full details.

[⬆ back to top](#table-of-contents)
