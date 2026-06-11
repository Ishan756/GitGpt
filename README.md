# RepoGPT

RepoGPT is a Next.js app for chatting with GitHub repositories after importing them into a PostgreSQL + pgvector database.

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL with the pgvector extension
- Docker if you want the quickest local database setup

### Install

```bash
pnpm install
```

### Database

You need a PostgreSQL database with pgvector enabled. A quick local option is:

```bash
docker run -d \
  --name pgvector \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=repogpt \
  -p 5432:5432 \
  ankane/pgvector
```

### Environment

Create a `.env` file in the project root with:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/repogpt
```

That is the only startup environment variable the app needs. OpenAI and GitHub credentials are entered in the settings page and stored in the database.

### Migrate

```bash
npx prisma migrate dev
```

### Run

```bash
pnpm dev
```

Open http://localhost:3000, go to /settings, and save your OpenAI key and GitHub access token before importing repositories.

## Notes

- The app redirects to /settings until API keys are saved.
- The app redirects to /repositories until at least one repository exists.
