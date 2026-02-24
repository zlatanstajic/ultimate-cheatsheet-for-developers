# Python

> Python programming language and package management.

Read more about [Python](https://www.python.org/).

## Table of Contents

* [Configuration](#configuration)
* [Virtual Environments](#virtual-environments)
* [Packages](#packages)
* [Utilities](#utilities)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Configuration

```bash
# Show Python version
python3 --version

# Change global python version (Ubuntu/Debian)
sudo update-alternatives --config python3

# Show path of active Python interpreter
which python3
```

[⬆ back to top](#table-of-contents)

## Virtual Environments

```bash
# Create a virtual environment in the current directory
python3 -m venv [env-name]

# Activate virtual environment (Linux/macOS)
source [env-name]/bin/activate

# Activate virtual environment (Windows)
[env-name]\Scripts\activate

# Deactivate virtual environment
deactivate

# Remove virtual environment
rm -rf [env-name]
```

[⬆ back to top](#table-of-contents)

## Packages

```bash
# Upgrade pip itself
python3 -m pip install --upgrade pip

# Install a package
pip install [package-name]

# Install a specific version
pip install [package-name]==[version]

# Install from requirements file
pip install -r requirements.txt

# List installed packages
pip list

# List outdated packages
pip list --outdated

# Freeze installed packages to a requirements file
pip freeze > requirements.txt

# Uninstall a package
pip uninstall [package-name]

# Show package details
pip show [package-name]
```

[⬆ back to top](#table-of-contents)

## Utilities

```bash
# Check CSV validity
pip install csvkit
csvstat [file-path].csv

# Run a simple HTTP server (serves current directory on port 8000)
python3 -m http.server 8000

# Pretty-print a JSON file
python3 -m json.tool [file.json]
```

[⬆ back to top](#table-of-contents)
