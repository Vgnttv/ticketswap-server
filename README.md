# Ticketswap Backend

This repo contains a backend for Ticketswap (https://github.com/Vgnttv/ticketswap-client). It uses Typescript, Koa, routing-controllers and TypeORM.


## Getting Started

### Postgres Database

Start a Postgres container using the following Docker command:

```bash
$ docker run \
  --rm \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres
```

### TypeStack Server

Then `cd` into the `server` directory and run `npm install` to install the dependencies.

Start the server with `nodemon`

