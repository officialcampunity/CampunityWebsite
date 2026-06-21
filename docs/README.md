# Campunity

Campunity is a full-stack, industry-level social media and academic note-sharing platform. It allows users to connect, share strictly categorized study materials, and engage in social interactions. Unauthenticated users can view the dashboard, but interaction requires a login.

## Overview
- **Frontend**: Next.js (App Router), Tailwind CSS v4, Vercel deployment.
- **Backend**: NestJS, TypeORM/Prisma, Render deployment.
- **Database**: PostgreSQL hosted on Neon.
- **Storage**: Cloudinary for all file and image uploads.
- **Authentication**: Local (Email/Password) and Google OAuth.

## Getting Started

### Setup
1. Clone the repository.
2. Setup the backend:
   ```bash
   cd backend
   npm install
   # Configure .env with Neon DB, Cloudinary, JWT, and Google keys.
   npm run start:dev
   ```
3. Setup the frontend:
   ```bash
   cd frontend
   npm install
   # Configure .env with backend API URL
   npm run dev
   ```

Check the `docs/` folder for comprehensive documentation.
