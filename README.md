# ESN

ESN Application (we are AWESOME)

## Contents

-   [Setup](#setup)
    -   [Prerequisites](#prequisites)
    -   [Steps](#steps)
-   [Rules](#rules)

## Setup

### Prequisites

-   [Node.js](https://nodejs.org/en/download)
-   [PostgreSQL](docs/CONTRIBUTING.md)

### Steps

1. Clone the repo

```bash
git clone git@github.com:cmusv-fse/18652-fse-f23-group-project-sb-2.git
```

2. Install node packages:

```bash
npm install
```

3. Create a database for local development if you haven't already! (see [Postgres Installation & Setup](docs/CONTRIBUTING.md))

4. Environment variables are used at runtime for signing and decoding JWTs, connecting to remote databases, etc.
   You should create a `.env` file in the root of the project with the following variables:

```
SECRET_KEY="<your-super-secret-key>"

POSTGRES_DB_USER="<postgres_db_user>" // use an empty string for local development

POSTGRES_DB_PASSWORD="<postgres_db_password>" // use an empty string for local development
```

> NOTE: Do not commit this file!!!

5. Start the server:

```bash
npm start
```

## WARNING

This is a public archive of the ESN project from CMUSV organization. You are not allowed to share, fork, or copy from this repo under any circumstances.
