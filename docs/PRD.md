# Product Requirements Document (PRD)

## Product Name
Campunity

## Vision
To create a strictly categorized academic resource-sharing platform with the engaging, modern feel of a social media network.

## Target Audience
University students seeking structured resources, while also wanting to connect with peers socially.

## Core Features
1. **Hybrid Authentication**: Login via Email/Password or Google Auth. The UI features a distinct red/white split screen.
2. **View-Only Access**: Unauthenticated users can view the dashboard and resources, but must log in to participate.
3. **Hierarchical Resource Upload**: Resources MUST be categorized rigidly by: `University > Course > Semester > Subject > Resource Type`.
4. **Cloud Storage**: All images and files are uploaded to and served from Cloudinary.
5. **Social Networking**: Real-time messaging, friends list, user profiles, likes, and comments.
6. **Reporting System**: Users can report inappropriate content or messages.

## Non-Functional Requirements
- **Performance**: Edge delivery via Vercel for the frontend.
- **Scalability**: NestJS backend deployed on Render, with Neon PostgreSQL for serverless, scalable database operations.
- **Design**: Premium UI matching exactly the provided mockups (Tailwind v4).
