# rebbu-api
Backend for packing management software Rebbu

## Getting started

### 1. Postgres setup

Initialize Postgres database by running `docker-compose up -d`.

### 2. Initialize Prisma

Run `npx prisma migrate dev --name init` to create DB schema inside Postgres. After that you have to generate the Prisma client by running `npx prisma generate`.

You can explore the database with Prisma studio easily by running `npx prisma studio`.

### 3. Start the app!

Run the app with `yarn start`.
