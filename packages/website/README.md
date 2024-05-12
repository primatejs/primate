# Primate website

This package contains the code for https://primatejs.com, which uses Primate
itself.

## Run locally

```sh
npm run local
```

## Edit content

The website's static content is located at [root docs][docs].

[priss]: https://github.com/primatejs/priss
[docs]: https://github.com/primatejs/primate/tree/master/docs

## Build and Run deployment using Docker locally

### Clean
```sh
docker stop primate
docker rmi primate:$(date '+%Y-%m-%d')
```

### Build
```sh
docker build -t primate:$(date '+%Y-%m-%d') -f packages/website/Dockerfile.fly-website .
docker builder prune
```

### Run
```sh
docker run --rm -d -p 6161:6161 --name=primate primate:$(date '+%Y-%m-%d')
docker logs primate -f
```

### Verify
```sh
docker exec -it primate sh
ls -lha /app/website
exit
```

## Build locally and deploy to fly.io via CLI

### Login
```sh
flyctl auth login
```

### Create app
```sh
flyctl apps create
```

Specify app name such as `primatejs` or one that isn't taken by someone else.

### Configure app

Make sure `packages/website/fly-website.toml` is in place and contains the app name chosen above.

### Build locally and deploy
```sh
fly deploy --local-only --no-cache -c packages/website/fly-website.toml
```

### Clean local builder
```sh
docker builder prune
```

### Logs
```sh
flyctl logs -a primate
```
