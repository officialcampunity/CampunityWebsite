# REST API Documentation

## Auth
- `POST /auth/google` - Login/Register via Google OAuth token.
- `GET /auth/me` - Get current authenticated user profile.

## Users
- `GET /users/:id` - Get user profile.
- `PUT /users/me` - Update profile settings.
- `POST /users/:id/follow` - Follow a user.
- `DELETE /users/:id/follow` - Unfollow a user.

## Notes (Posts)
- `GET /notes` - Get personalized feed of notes.
- `POST /notes` - Create a new note.
- `GET /notes/:id` - Get a specific note.
- `DELETE /notes/:id` - Delete a note.

## Interactions
- `POST /notes/:id/like` - Like a note.
- `DELETE /notes/:id/like` - Unlike a note.
- `GET /notes/:id/comments` - Get comments for a note.
- `POST /notes/:id/comments` - Add a comment.

## Messages
- `GET /messages` - Get conversation list.
- `GET /messages/:userId` - Get messages with a specific user.
- `POST /messages` - Send a message.
