# QuizMaster Frontend Structure

This document defines the frontend organization strategy for the React, Vite, and Tailwind MVP.

## Technology

Frontend stack:

- React
- Vite
- Tailwind

The frontend should be built after the backend contracts are clear enough to avoid rewriting pages around unstable APIs.

## Folder Structure

Suggested structure:

```text
frontend/src
|-- app
|-- features
|   |-- auth
|   |-- quizzes
|   |-- attempts
|   `-- admin
|-- components
|-- layouts
|-- lib
|-- routes
`-- styles
```

## Folder Responsibilities

### app

Application setup.

May contain later:

- App component
- Provider setup
- Router setup
- Application-level initialization

### features/auth

Authentication feature.

May contain later:

- Login page
- Register page
- Auth API functions
- Auth state hook or context
- Current user loading

### features/quizzes

Quiz browsing feature.

May contain later:

- Quiz catalog page
- Quiz detail page
- Quiz API functions
- Quiz list item components

### features/attempts

Quiz-taking and result feature.

May contain later:

- Take quiz page
- Result page
- Review answers page
- My attempts page
- Attempt API functions
- Question display components

### features/admin

Admin content management feature.

May contain later:

- Category management page
- Admin quiz list page
- Create quiz page
- Edit quiz page
- Question management page
- Admin API functions
- Admin-only form components

### components

Shared UI components.

Use this folder only for components reused across features, such as:

- Button
- Input
- Select
- Textarea
- Modal
- Loading state
- Empty state

Do not place every component here by default.

### layouts

Layout components.

May contain later:

- Public layout
- Authenticated layout
- Admin layout

### lib

Shared frontend utilities.

May contain later:

- HTTP client
- Token storage helpers
- Route guards
- Common formatting helpers

### routes

Route definitions if they are not kept inside `app`.

### styles

Tailwind and global CSS.

## Page Structure

Public pages:

- Landing page
- Login page
- Register page
- Quiz catalog page
- Quiz detail page

Authenticated pages:

- Take quiz page
- Result page
- Review answers page
- My attempts page

Admin pages:

- Category management page
- Admin quiz list page
- Create quiz page
- Edit quiz page
- Question management page

## API Client Organization

- Keep feature-specific API functions inside the relevant feature folder.
- Keep shared HTTP setup in `lib`.
- Do not create one huge API file for the whole app.
- Keep request and response shapes close to the screens that use them.

## Auth State Organization

The MVP needs simple auth state:

- Access token storage
- Current user loading
- Login
- Register
- Logout
- Role checks for route display

Backend authorization remains the source of truth. Frontend role checks are for navigation and user experience only.

## Component Size Rules

- Keep page components focused on page flow.
- Extract repeated form fields into small components.
- Keep admin forms readable and split when they grow.
- Avoid components that handle unrelated features.
- Avoid one giant state object when smaller state is clearer.
- Avoid deeply nested JSX that is hard to scan.

## UI Scope

The MVP should build the actual quiz experience first. Avoid spending too much time on a marketing-heavy landing page before quiz-taking, result, review, and admin flows work.
