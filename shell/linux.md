# Linux

> Family of open source Unix-like operating systems based on the Linux kernel.

Read more about [Linux](https://www.linux.org/).

## Table of Contents

* [Misc](#misc)
* [Useful](#useful)
* [Advanced Package Tool](#advanced-package-tool)
* [Directory](#directory)
* [File](#file)
* [Aliases](#aliases)
* [Encode-Decode](#encode-decode)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

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
apt-get install dconf-tools && dconf-editor

# Apache server log location
/var/log/apache2/error.log

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

# Install app
apt install [app-name]

# Remove app
apt remove [app-name]

# Update apt
apt update

# List upgradable files
apt list -u

# Upgrade apt
apt upgrade

# Clean apt
apt autoclean

# Remove repository
add-apt-repository -r ppa:[ppa-to-remove]

# Update key for repository
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys [key]
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

# Extract tar file
tar -vxjf [filename]

# Read file live
tail -f [filename]

# Copy file
cp [source-filename] [location-filename]

# Empty file contents
truncate -s 0 [filename]

# Change file permissions
chmod [permissions] [filename]

# Change file owner
chown [user]:[group] [filename]
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
