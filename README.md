# Calendly - Calendly Clone

Calendly Clone is a full-stack scheduling platform built for the SDE Intern assignment.

## Tech Stack

- Frontend: Next.js 16 (App Router), TypeScript
- Backend: Nodejs + Express 5 , TypeScript
- Database: PostgreSQL + Prisma
- Security and hardening: Helmet, compression, express-rate-limit
- Optional integrations: SMTP email, callback, Google Calendar + Meet

## Project Structure

- `frontend`: Next.js app with admin and public booking UI
- `backend`: Express API, Prisma schema, migrations/seed scripts
- `docs/ASSIGNMENT_CHECKLIST.md`: requirement status + step-by-step understanding tracker

## Setup

### 1) Backend

```bash
cd backend
npm install
```

Create `.env` in `backend`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/calendly
PORT=3001
FRONTEND_URL=http://localhost:3000

# Optional integrations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
HOST_EMAIL=host@example.com

# Google Calendar / Meet support for backend sync
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
# Optional but recommended for assignment no-login mode:
# fallback refresh token used to create Google Calendar events + Meet links
GOOGLE_CALENDAR_REFRESH_TOKEN="your_google_oauth_refresh_token"
```

Run Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Start API:

```bash
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Assignment mode (no login required admin simulation via proxy)
ASSIGNMENT_DEFAULT_USER_ID=default-user-id

# Needed only if you want login/Google OAuth UI flows
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-random-secret
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Start web app:

```bash
npm run dev
```

## Core Pages

- `/dashboard`: event type card grid, active toggle, copy link, create/delete
- `/availability`: weekly availability + timezone + date overrides + multiple daily windows
- `/meetings`: upcoming/past tabs, organizer/invitee visibility, cancellation
- `/[slug]`: public booking page with calendar, slots, booking form, and rescheduling support
- `/booking-confirmed/[bookingId]`: confirmation details and Google Calendar link
- `/cancel/[cancelToken]`: invitee self-service cancel or reschedule

## Screenshots

The following screenshots illustrate key user flows and platform capabilities.

### Landing Page (`/`)

![Landing Page](docs/screenshots/01-homepage.png)

### Dashboard - Event Types (`/dashboard`)

![Dashboard Event Types](docs/screenshots/02-dashboard-event-types.png)

### Availability - Weekly Hours (`/availability`)

![Availability Weekly Hours](docs/screenshots/03-availability-weekly-hours.png)

### Availability - Date Overrides (`/availability`)

![Availability Date Overrides](docs/screenshots/04-availability-date-overrides.png)

### Meetings - Upcoming (`/meetings`)

![Meetings Upcoming](docs/screenshots/05-meetings-upcoming.png)

### Public Booking Page (`/[slug]`)

![Public Booking Page](docs/screenshots/06-public-booking-page.png)

### Booking Confirmed (`/booking-confirmed/[bookingId]`)

![Booking Confirmed](docs/screenshots/07-booking-confirmed.png)

### Cancel or Reschedule (`/cancel/[cancelToken]`)

![Cancel or Reschedule](docs/screenshots/08-cancel-reschedule.png)

### Settings - Google Calendar (`/settings`)

![Settings Google Calendar](docs/screenshots/09-settings-google-calendar.png)

### Confirmation Email

![Confirmation Email](docs/screenshots/10-confirmation-email.png)

### Google Calendar Event Created

![Google Calendar Scheduled Event](docs/screenshots/11-google-calendar-scheduled.png)

## Bonus Features Implemented

- Backend hardening via Helmet, compression, rate limits
- Public cancel/reschedule flow via cancel token
- Cancellation email notifications (invitee + host) when SMTP is configured
- Buffer-time fields in event type form and slot filtering
- SMTP email notifications (invitee + host) when configured
- Date overrides admin section
- Multiple availability schedules (multiple time windows per day)
- Custom invitee questions (company, phone, notes)
- Google Calendar event sync + Google Meet link capture when a valid refresh token is available

## API Routes

- `GET /api/event-types`
- `POST /api/event-types`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`
- `GET /api/event-types/:slug`
- `GET /api/availability`
- `PUT /api/availability`
- `GET /api/availability/date-overrides`
- `POST /api/availability/date-overrides`
- `DELETE /api/availability/date-overrides/:id`
- `GET /api/available-slots?slug=:slug&date=:date`
- `POST /api/bookings`
- `GET /api/bookings/upcoming`
- `GET /api/bookings/past`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings/cancel-token/:cancelToken`
- `PATCH /api/bookings/cancel-token/:cancelToken`
- `PATCH /api/bookings/cancel-token/:cancelToken/reschedule`
- `GET /api/health`

## Schema Diagram (ERD-style)

```text
User (1) ---- (N) EventType ---- (N) Booking
  |                 |
  |                 +---- fields: bufferBeforeMins, bufferAfterMins
  |
  +---- (N) Availability ---- (N) AvailabilityWindow
  |
  +---- (N) DateOverride
  |
  +---- (N) Account
  |
  +---- (N) Session

VerificationToken (standalone token table)
```

## Design Decisions

- Slot generation runs in this sequence:
  1. Validate event type and requested date
  2. Resolve date override (blocked/custom hours) before weekly rules
  3. Resolve one or more daily availability windows
  4. Generate interval slots by `durationMins` across each window
  5. Filter overlaps against confirmed bookings
  6. Apply buffer windows before/after slots
  7. Remove past slots
- Double booking prevention:
  - Booking creation is wrapped in a DB transaction
  - Overlap rows are queried with `FOR UPDATE` lock semantics before insert
- Rate limiting:
  - Global API limiter is enabled for all `/api/*` routes

## Assumptions

- Admin side supports assignment mode by simulating a logged-in default user when no session exists
- Time is persisted in UTC; UI displays local timezone values
- SMTP are optional and fail gracefully when not configured
- Google Meet generation is best-effort and requires at least one valid Google refresh token source:
  - per-user connected Google account, or
  - backend `GOOGLE_CALENDAR_REFRESH_TOKEN` fallback (recommended for no-login assignment mode)
