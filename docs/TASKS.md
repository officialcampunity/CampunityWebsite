# Development Tasks

## Phase 1: Documentation (Completed)
- Generate core `.md` files in `docs/` folder to establish architecture and rules.

## Phase 2: Backend Foundation
- Initialize NestJS project in `/backend`.
- Configure PostgreSQL database connection with TypeORM/Prisma.
- Implement Google OAuth strategies.
- Create User module (entities, controllers, services).
- Create Note module (CRUD operations).

## Phase 3: Frontend Structure
- Refactor `src/app/page.tsx` to match the new Dashboard layout.
- Create `components/Sidebar.tsx` (Activity, Stories).
- Create `components/Feed.tsx` (Main feed content).
- Create `components/RightSidebar.tsx` (Messages, Suggestions).

## Phase 4: Integration
- Connect Next.js frontend to NestJS backend APIs using React Query.
- Implement real authentication flow.
- Ensure data updates correctly across the dashboard.
