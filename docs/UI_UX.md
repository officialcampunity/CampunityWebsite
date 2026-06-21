# UI/UX Guidelines

## Authentication Screen
- **Red & White Theme**: The login and signup screens feature a bold 50/50 split screen design (Red and White).
- Forms include inputs for Email/Password and social login buttons (Google, Facebook, GitHub, LinkedIn).

## Dashboard
- **View-Only Mode**: The dashboard feed is visible to guests without logging in.
- **Action Guards**: Clicking "Like", "Comment", or "Upload" while unauthenticated triggers the Red/White Authentication modal or redirects to the login page.
- **File Hierarchy Selector**: The upload interface requires users to navigate a cascading dropdown system (University -> Course -> Semester -> Subject) before uploading.

## Style Tokens
- Follow Tailwind v4 principles.
- Clean typography (`Outfit` or `Inter`).
