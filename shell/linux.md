---
last_reviewed: 2026-03-27
---

# Linux

> Family of open source Unix-like operating systems based on the Linux kernel.

Read more about [Linux](https://www.linux.org/).

## Table of Contents

* [Misc](#misc)
* [Useful](#useful)
* [Advanced Package Tool](#advanced-package-tool)
* [Services](#services)
* [Directory](#directory)
* [File](#file)
* [Aliases](#aliases)
* [Encode-Decode](#encode-decode)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

> **See also:** [cURL](curl.md) — used for downloading files and apt key management.

## Misc

```bash
# Switch to superuser in terminal
sudo su

# Get list of all processes for app name
ps -ef | grep [app-name]

# Kill all processes by given name
killall [process_name]

# Kill a port process
fuser -k [port-number]/tcp

# Get computer's hostname
hostname -I

# Clear swap space
swapoff -a && swapon -a

# Runs a sound test with static bouncing back and forth
speaker-test --channels 2 --rate 48000 --device hw:0,3

# Loop command
watch -n [number-of-seconds] [command]

# Show live date and time
watch -n 1 date

# Information about how long system has been running
uptime
```

[⬆ back to top](#table-of-contents)

## Useful

```bash
# Install & run OS configuration tools
apt install dconf-tools && dconf-editor

# Follow Apache error log live
tail -f /var/log/apache2/error.log

# List of apt sources
nano /etc/apt/sources.list

# Go to folder with crash reports
cd /var/crash

# Install & run to list folder tree
apt-get install tree && tree
# Show hidden files in tree as well
tree -a
```

[⬆ back to top](#table-of-contents)

## Advanced Package Tool

```bash
# Search packages
apt-cache search [package-name]

# Install package
apt install [package-name]

# Remove package
apt remove [package-name]

# Remove package and its configuration files
apt purge [package-name]

# Update package index
apt update

# List upgradable packages
apt list -u

# Upgrade all packages
apt upgrade

# Clean downloaded package files
apt autoclean

# Remove unused dependencies
apt autoremove

# Remove repository
add-apt-repository -r ppa:[ppa-to-remove]

# Add a signed repository key (modern approach; apt-key is deprecated since Ubuntu 22.04)
curl -fsSL [key-url] | sudo gpg --dearmor -o /etc/apt/keyrings/[keyring-name].gpg
```

[⬆ back to top](#table-of-contents)

## Services

```bash
# Start a service
systemctl start [service-name]

# Stop a service
systemctl stop [service-name]

# Restart a service
systemctl restart [service-name]

# Reload service configuration without restart
systemctl reload [service-name]

# Show service status
systemctl status [service-name]

# Enable service to start on boot
systemctl enable [service-name]

# Disable service from starting on boot
systemctl disable [service-name]

# List all running services
systemctl list-units --type=service --state=running

# Check which process is listening on a port
ss -tlnp | grep [port-number]
```

[⬆ back to top](#table-of-contents)

## Directory

```bash
# List current path
pwd

# List directory content
ls

# Enter directory
cd [directory-name]

# Create new directory
mkdir [directory-name]

# Create new directory only if it doesn't exist
mkdir -p [directory-name]

# Copy directory
cp -R [source-directory] [destination-directory]

# Move directory
mv [directory-name] [destination-directory]

# Remove directory
rm -d [directory-name]

# Confirm to remove
rm -i [filename]

# Remove all files with extension
rm -fv *.[extension]
```

[⬆ back to top](#table-of-contents)

## File

```bash
# Create shortcut
ln -s [destination-file] [destination-shortcut]

# Extract a .tar.bz2 archive (-v verbose, -x extract, -j bzip2, -f file)
tar -vxjf [filename].tar.bz2

# Extract a .tar.gz archive
tar -xzf [filename].tar.gz

# Create a .tar.gz archive from a directory
tar -czf [archive-name].tar.gz [directory]

# Get first 5 lines in a file
head -n 5 [file-path]

# Check if website is opened by reading remote Apache access logs
# Usage: connect to server and follow access log
# Example: ssh [server] && cd /var/log/apache2 && tail -f *-access.log

# Read file live
tail -f [filename]

# Copy file
cp [source-filename] [location-filename]

# Empty file contents
truncate -s 0 [filename]

# Change file permissions (octal: owner/group/others — 4=read, 2=write, 1=execute)
chmod [permissions] [filename]
# chmod 755 script.sh    → owner: rwx, group: r-x, others: r-x (executable script)
# chmod 644 file.txt     → owner: rw-, group: r--, others: r-- (readable file)
# chmod 600 .env         → owner: rw-, group: ---, others: --- (private file)

# Change file owner
chown [user]:[group] [filename]
# chown www-data:www-data /var/www/html   → set web server ownership
# chown -R $USER:$USER ./project          → recursively take ownership
```

[⬆ back to top](#table-of-contents)

## Aliases

```bash
# List of aliases
vim ~/.bashrc

# Create alias
alias [alias-name]="[command]"

# Remove alias
unalias [alias-name]

# Force list of aliases to reload in current session
source ~/.bashrc

# List all defined aliases
alias
```

[⬆ back to top](#table-of-contents)

## Encode-Decode

```bash
# base64 encode without new line
echo -n "example" | base64 -w 0

# base64 decode
echo "ZXhhbXBsZQ==" | base64 -d

# URL encode
python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "string to encode"

# URL decode
python3 -c "import urllib.parse, sys; print(urllib.parse.unquote(sys.argv[1]))" "string%20to%20decode"
```

[⬆ back to top](#table-of-contents)
