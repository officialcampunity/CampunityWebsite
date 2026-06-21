# Security Guidelines

## Authentication
- **OAuth**: Google OAuth is the primary login method. The frontend uses NextAuth to handle the OAuth flow and pass the JWT to the backend.
- **JWT**: The NestJS backend verifies the JWT using Passport JWT strategies. All protected routes require a valid Bearer token.

## Authorization
- Users can only edit or delete their own notes and comments.
- Role-based access control (RBAC) may be implemented later for admin features.

## Data Protection
- **Sanitization**: All incoming data to the NestJS backend is sanitized and validated using `class-validator`.
- **CORS**: Configured strictly in NestJS to only allow requests from the official frontend domain.
- **Rate Limiting**: Applied to sensitive endpoints (e.g., login, note creation) to prevent abuse.

## Environment Variables
- Sensitive keys (Database URL, Google Client ID/Secret, JWT Secret) must NEVER be committed to version control. Use `.env` files locally and secure secrets managers in production.
