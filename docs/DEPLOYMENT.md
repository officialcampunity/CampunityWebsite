# Deployment Guide

## Infrastructure
- **Frontend (Next.js)**: Vercel is recommended for optimal Edge caching, Serverless functions, and CI/CD out-of-the-box.
- **Backend (NestJS)**: Render, Railway, or AWS Elastic Beanstalk. Dockerized deployment is preferred.
- **Database (PostgreSQL)**: Supabase, Neon, AWS RDS, or Render PostgreSQL.

## CI/CD Pipeline
- GitHub Actions for automated testing and linting on Pull Requests.
- Main branch pushes trigger automated deployments to Vercel (Frontend) and Render/Railway (Backend).

## Environment Variables required in Production
### Frontend
- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Backend
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL` (for CORS)
- `GOOGLE_CLIENT_ID` (if verifying directly on backend)
