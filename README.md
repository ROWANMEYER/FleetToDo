# Fleet Operations Daily Planner App

This is the frontend client for the FleetCore system, built with React Native (Expo) and Convex.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Connect to the existing FleetCore Convex backend:
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and select the existing project.

3. Configure environment variables:
   Create a `.env.local` file with your Convex URL (if not automatically handled by `npx convex dev`):
   ```
   EXPO_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

4. Run the app:
   ```bash
   npm start
   ```

## Project Structure

- `app/`: Expo Router pages
  - `index.tsx`: Main dashboard ("My Day")
  - `_layout.tsx`: Convex provider setup
- `convex/`: Backend logic
  - `schema.ts`: Database schema (Tasks, Attachments, + existing Fleet tables)
  - `tasks.ts`: Task logic (My Day query, manual task mutations)
  - `health.ts`: Fleet Health Score calculation
  - `attachments.ts`: Attachment upload logic
  - `common.ts`: Shared helpers (e.g., fleet issue detection)

## Features implemented

- **My Day Dashboard**: Combines manual tasks and generated fleet alerts.
- **Fleet Health Score**: Real-time calculation based on active issues.
- **Task Management**: Create, complete, and view tasks.
- **Attachments**: Schema and upload logic ready.
