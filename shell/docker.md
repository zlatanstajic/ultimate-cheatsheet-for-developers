# Docker

> Container platform for building, shipping, and running applications.

Read more about [Docker](https://www.docker.com/).

## Table of Contents

* [Build](#build)
* [Run](#run)
* [Manage Containers](#manage-containers)
* [Manage Images](#manage-images)
* [Execute](#execute)
* [Logs](#logs)
* [Docker Compose](#docker-compose)
* [Notes](#notes)

[↩ back to list of cheatsheets](README.md#list-of-cheatsheets)

## Build

```bash
# Build an image from a Dockerfile in the current directory
docker build -t [image-name]:[tag] .

# Build with build arguments (non-sensitive only; see Notes for secrets)
docker build --build-arg ENV=[value] -t [image-name]:[tag] .

# Build using a secret (BuildKit) — avoids baking credentials into image history
DOCKER_BUILDKIT=1 docker build \
  --secret id=composer_auth,src=./auth.json \
  -t [image-name]:[tag] .

# Build targeting a specific stage in a multi-stage Dockerfile
docker build --target [stage-name] -t [image-name]:[tag] .

# Force a rebuild without using the layer cache
docker build --no-cache -t [image-name]:[tag] .
```

[⬆ back to top](#table-of-contents)

## Run

```bash
# Run a container (foreground)
docker run [image-name]:[tag]

# Run a container in detached mode (background)
docker run -d [image-name]:[tag]

# Run with a custom container name
docker run -d --name [container-name] [image-name]:[tag]

# Run with port mapping (host:container)
docker run -d -p [host-port]:[container-port] [image-name]:[tag]

# Run with a volume mount (host-path:container-path)
docker run -d -v [host-path]:[container-path] [image-name]:[tag]

# Run with environment variables
docker run -d -e KEY=value [image-name]:[tag]

# Run with an env file
docker run -d --env-file .env [image-name]:[tag]

# Run using the most recently created image ID
docker run $(docker images -q | head -1)

# Run an ephemeral container (removed automatically on exit)
docker run --rm [image-name]:[tag]
```

[⬆ back to top](#table-of-contents)

## Manage Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a running container
docker stop [container-id|container-name]

# Start a stopped container
docker start [container-id|container-name]

# Restart a container
docker restart [container-id|container-name]

# Remove a stopped container
docker rm [container-id|container-name]

# Force-remove a running container
docker rm -f [container-id|container-name]

# Remove all stopped containers
docker container prune
```

[⬆ back to top](#table-of-contents)

## Manage Images

```bash
# List all local images
docker images

# Pull an image from a registry
docker pull [image-name]:[tag]

# Remove an image
docker rmi [image-name]:[tag]

# Remove all dangling (untagged) images
docker image prune

# Remove all unused images
docker image prune -a

# Tag an image
docker tag [source-image]:[tag] [target-image]:[tag]

# Push an image to a registry
docker push [image-name]:[tag]

# Inspect image layer history (useful to audit build args exposure)
docker history [image-name]:[tag]
```

[⬆ back to top](#table-of-contents)

## Execute

```bash
# Open an interactive shell in a running container (bash)
docker exec -it [container-id|container-name] /bin/bash

# Fallback for slim/Alpine images that only ship sh
docker exec -it [container-id|container-name] /bin/sh

# Run a one-off command in a running container
docker exec [container-id|container-name] [command]

# Copy a file from a container to the host
docker cp [container-id]:[container-path] [host-path]

# Copy a file from the host to a container
docker cp [host-path] [container-id]:[container-path]
```

[⬆ back to top](#table-of-contents)

## Logs

```bash
# Show container logs
docker logs [container-id|container-name]

# Follow log output (live tail)
docker logs -f [container-id|container-name]

# Show last N lines
docker logs --tail [n] [container-id|container-name]

# Show logs with timestamps
docker logs -t [container-id|container-name]
```

[⬆ back to top](#table-of-contents)

## Docker Compose

> Uses the v2 plugin (`docker compose`). The standalone `docker-compose` v1 binary was deprecated in July 2023.

```bash
# Start all services defined in docker-compose.yml (detached)
docker compose up -d

# Start and force-recreate containers
docker compose up -d --force-recreate

# Build images before starting
docker compose up -d --build

# Stop and remove containers, networks
docker compose down

# Stop, remove containers, and delete named volumes
docker compose down -v

# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f [service-name]

# Run a one-off command in a service container
docker compose exec [service-name] [command]

# Scale a specific service
docker compose up -d --scale [service-name]=[n]

# List running Compose services
docker compose ps
```

[⬆ back to top](#table-of-contents)

## Notes

* **Avoid `sudo`**: add your user to the `docker` group so you do not need `sudo` for every command:

  ```bash
  sudo usermod -aG docker $USER
  # Log out and back in for the change to take effect
  ```

* **Never pass secrets via `--build-arg`**: build args are stored in image layer history and visible via `docker history`. Use [BuildKit secrets](https://docs.docker.com/build/secrets/) instead.
* **`/bin/bash` vs `/bin/sh`**: slim and Alpine-based images often only include `/bin/sh`. Try `/bin/sh` if `/bin/bash` fails in `exec`.
* **`docker compose` (v2)** is the current standard. If your system still has `docker-compose` (v1), upgrade to Docker Desktop ≥ 4.x or install the Compose plugin.

[⬆ back to top](#table-of-contents)
