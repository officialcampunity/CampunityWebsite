# Database Schema (Neon PostgreSQL)

## Administrative Hierarchy
These tables define the strict categorization structure for resources.

### `universities`
- `id` (UUID, PK)
- `name` (String)

### `courses`
- `id` (UUID, PK)
- `university_id` (UUID, FK)
- `name` (String)

### `semesters`
- `id` (UUID, PK)
- `course_id` (UUID, FK)
- `name` (String)

### `subjects`
- `id` (UUID, PK)
- `semester_id` (UUID, FK)
- `name` (String)

### `resource_types`
- `id` (UUID, PK)
- `subject_id` (UUID, FK)
- `type` (Enum: PDF, Image, Video, Link, etc.)

## User Data & Resources

### `users`
- `id` (UUID, PK)
- `email` (String, Unique)
- `password` (String, Nullable if Google Auth)
- `google_id` (String, Unique, Nullable)
- `username` (String, Unique)

### `resources` (Notes/Posts)
- `id` (UUID, PK)
- `author_id` (UUID, FK -> users)
- `resource_type_id` (UUID, FK -> resource_types)
- `cloudinary_url` (String)
- `description` (Text)
- `created_at` (Timestamp)

### `reports`
- `id` (UUID, PK)
- `reporter_id` (UUID, FK -> users)
- `resource_id` (UUID, FK -> resources, Nullable)
- `message_id` (UUID, FK -> messages, Nullable)
- `reason` (Text)
- `status` (Enum: Pending, Reviewed, Resolved)
