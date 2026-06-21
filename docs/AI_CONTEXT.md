# AI Context

## Project State
This project is currently transitioning from a simple landing page to a full-stack Next.js and NestJS application with a PostgreSQL database. 

## Key Technical Decisions
- **Next.js**: The frontend is using Next.js 15 App Router.
- **Tailwind v4**: We recently migrated styling from older tailwind directives to Tailwind v4 (`@import "tailwindcss";` in `globals.css`).
- **NestJS**: The backend is built using NestJS to ensure a scalable, enterprise-grade architecture.
- **Strict Adherence to Design**: The user has requested pixel-perfect recreation of the provided UI design. 
- **No Mocks**: No mock data is allowed in the final production view. All dynamic elements (feed, users, comments) must query the backend.

## AI Instructions for Future Iterations
1. ALWAYS read this file before making major architectural changes.
2. Ensure you are editing files in the correct directory (`/frontend` or `/backend`).
3. If running `npm run dev` in the frontend and encountering Tailwind issues, recall that we are using `@tailwindcss/postcss` with Next.js.
4. Keep the database schema aligned with `DATABASE.md`.
