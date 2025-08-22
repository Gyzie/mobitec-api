# Mobitec-API

## Description

Api used by https://github.com/marloustolk/FlipDotAnimation and https://github.com/mvannes/mobitec

## Run with Docker

```
services:
  mobitec_api:
    image: ghcr.io/gyzie/mobitec-api:main
    ports:
      - 3080:3000
    environment:
      - PORT=3000
      - API_KEY=secret-key-1 secret-key-2
    volumes:
      - /container_data/mobitec-api/data:/app/data
    restart: always
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Generate migrations

```
npm run build && typeorm migration:generate src/migrations/create-message -d ./dist/datasource.js
```