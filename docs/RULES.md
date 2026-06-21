# Coding Rules and Conventions

## 1. General
- Write clean, self-documenting code.
- Avoid using "mock" or "fake" hardcoded data in production views; always connect to the backend.
- Prefer TypeScript for both frontend and backend to maintain type safety.

## 2. Frontend (Next.js)
- Use functional components and React Hooks.
- Keep components small and reusable.
- Use Tailwind CSS v4 for all styling. Do not use inline styles unless absolutely necessary for dynamic calculations.
- Place reusable components in `src/components`.

## 3. Backend (NestJS)
- Follow NestJS module-based architecture.
- Keep business logic in Services, not Controllers.
- Use DTOs (Data Transfer Objects) for all incoming requests.
- Validate incoming data using `class-validator`.

## 4. Database
- Use snake_case for database table and column names.
- Always include `created_at` and `updated_at` timestamps on entities.
- Ensure foreign keys are properly indexed.
