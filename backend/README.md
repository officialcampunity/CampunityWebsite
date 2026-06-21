# Campunity API

NestJS backend for the Campunity educational resource sharing platform.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Install dependencies: `npm install`
4. Start dev server: `npm run start:dev`
5. Run tests: `npm test`

## Environment Variables

See `.env.example` for all required configuration.

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user profile
- `GET /api/resources` — Paginated resource listing
- ... (full list in source controllers)

## Architecture

- NestJS 11 with TypeORM
- PostgreSQL database
- JWT-based authentication with Passport
- Real-time notifications via Socket.IO
- Cloudinary for file storage

## Production

```bash
npm run build
NODE_ENV=production node dist/main
```

Or use Docker:
```bash
docker build -t campunity-api .
docker run -p 4000:4000 --env-file .env campunity-api
```
