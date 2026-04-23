# WellTrack - Symptom & Wellness Tracker
## Requirements Document

**Timeline:** 12 Weeks  
**Target:** 50 Beta Users  
**Stack:** React + Node.js/Express + PostgreSQL

---

## Overview

We're building a wellness tracking app for people with chronic health conditions. Users can log symptoms, moods, medications, and daily habits, then view trends to identify patterns. Think of it as a health journal with basic analytics.

The MVP needs to be simple enough that someone with brain fog or fatigue can use it quickly, but powerful enough to surface useful insights over time.

---

## Tech Stack

- **Frontend:** React with TypeScript, Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with refresh tokens
- **Hosting:** TBD (Vercel, Railway, or Render)

---

## Data Model

### Users

```
User
  - id (UUID)
  - email (unique)
  - password_hash
  - display_name
  - timezone (default: UTC)
  - created_at
```

### Symptoms

```
Symptom
  - id (UUID)
  - user_id (nullable - null means system default)
  - name
  - category (pain, neurological, digestive, etc.)
  - is_active (boolean)

SymptomLog
  - id (UUID)
  - user_id
  - symptom_id
  - severity (1-10)
  - notes (optional)
  - logged_at
  - created_at
```

**Default symptoms to seed:** Headache, Fatigue, Joint Pain, Muscle Pain, Nausea, Brain Fog, Dizziness, Insomnia, Anxiety, Stomach Pain, Back Pain

### Moods

```
MoodLog
  - id (UUID)
  - user_id
  - mood_score (1-5)
  - energy_level (1-5, optional)
  - stress_level (1-5, optional)
  - notes (optional)
  - logged_at
  - created_at
```

### Medications

```
Medication
  - id (UUID)
  - user_id
  - name
  - dosage (optional, e.g., "500mg")
  - frequency (optional, e.g., "twice daily")
  - is_active (boolean)
  - created_at

MedicationLog
  - id (UUID)
  - user_id
  - medication_id
  - taken (boolean)
  - taken_at (optional)
  - notes (optional)
  - created_at
```

### Habits

```
Habit
  - id (UUID)
  - user_id (nullable - null means system default)
  - name
  - tracking_type (boolean | numeric | duration)
  - unit (optional - "hours", "glasses", etc.)
  - is_active (boolean)

HabitLog
  - id (UUID)
  - user_id
  - habit_id
  - value_boolean (for yes/no habits)
  - value_numeric (for number habits)
  - value_duration (minutes, for duration habits)
  - notes (optional)
  - logged_at
  - created_at
```

**Default habits to seed:** Sleep Duration (duration), Water Intake (numeric/glasses), Exercise (boolean), Alcohol (boolean), Caffeine (numeric/cups)

---

## Core Features

### Authentication
- Register with email/password
- Login/logout
- Password reset via email
- Edit profile (name, timezone)
- Delete account (removes all data)

### Daily Logging
- Log symptoms with severity (1-10) and optional notes
- Log mood (1-5) with optional energy/stress levels
- Log whether medications were taken
- Log habits (yes/no, numbers, or duration depending on type)
- Edit or delete any log entry
- Backfill logs for previous days

### Customization
- Add custom symptoms
- Add custom habits
- Hide system symptoms/habits you don't want to track
- Add/edit/remove medications

### Viewing Data
- Dashboard showing today's entries with quick-add buttons
- History view showing past entries by day
- Trend charts (7/30/90 day views) for symptoms and mood
- Calendar heatmap showing which days you logged
- Export data as CSV

---

## Screens

### Dashboard (Home)
The main screen after login. Shows:
- Today's date
- Summary of what's been logged today
- Quick-add buttons for each log type
- Simple streak or "days logged this week" indicator

### Log Entry (Modal or Page)
- Select what you're logging
- Big, easy-to-tap controls for ratings
- Optional notes field
- Date picker (defaults to now)
- Save button

### History
- Scrollable list of entries grouped by day
- Tap to expand/edit
- Filter by type (symptoms, mood, meds, habits)

### Trends
- Line charts showing symptom severity over time
- Mood/energy/stress charts
- Calendar view with color-coded activity
- Date range picker

### Settings
- Edit profile
- Manage symptoms list
- Manage habits list
- Manage medications
- Export data
- Delete account
- Logout

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### User
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`

### Symptoms
- `GET /api/symptoms` - get all (system + custom)
- `POST /api/symptoms` - create custom
- `PATCH /api/symptoms/:id` - update
- `DELETE /api/symptoms/:id` - delete custom

### Symptom Logs
- `GET /api/symptom-logs?startDate=&endDate=&limit=&offset=`
- `POST /api/symptom-logs`
- `PATCH /api/symptom-logs/:id`
- `DELETE /api/symptom-logs/:id`

### Mood Logs
- `GET /api/mood-logs?startDate=&endDate=`
- `POST /api/mood-logs`
- `PATCH /api/mood-logs/:id`
- `DELETE /api/mood-logs/:id`

### Medications
- `GET /api/medications`
- `POST /api/medications`
- `PATCH /api/medications/:id`
- `DELETE /api/medications/:id`

### Medication Logs
- `GET /api/medication-logs?startDate=&endDate=`
- `POST /api/medication-logs`
- `PATCH /api/medication-logs/:id`
- `DELETE /api/medication-logs/:id`

### Habits
- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:id`
- `DELETE /api/habits/:id`

### Habit Logs
- `GET /api/habit-logs?startDate=&endDate=`
- `POST /api/habit-logs`
- `PATCH /api/habit-logs/:id`
- `DELETE /api/habit-logs/:id`

### Insights & Export
- `GET /api/insights/trends?type=&days=`
- `GET /api/export/csv?startDate=&endDate=`

---

## Timeline

### Weeks 1-3: Backend Foundation
- Project setup, database schema, migrations
- Auth system (register, login, JWT, refresh tokens)
- All CRUD endpoints for logs, symptoms, medications, habits
- Basic input validation and error handling

### Weeks 4-6: Frontend Foundation
- React app setup with routing
- Auth pages and protected routes
- Dashboard layout
- Logging forms/modals for all types

### Weeks 7-9: Full Features
- History/timeline view
- Trend charts and calendar view
- Settings and customization screens
- Data export

### Weeks 10-12: Polish & Launch
- Bug fixes and testing
- Performance and mobile responsiveness
- Deploy to production
- Onboard beta users

---

## Nice-to-Haves (If Time Permits)
- Daily reminder emails
- Correlation insights ("You sleep worse on days you have caffeine")
- PDF export for doctor visits
- Onboarding flow for new users

---

## Out of Scope
- Mobile apps
- Wearable integrations
- Sharing with doctors/family
- Offline mode

---

## Notes

- Keep the UI simple and calming—avoid clinical/medical aesthetics
- Use soft colors (teal, sage) not harsh blues
- All times should respect user's timezone
- Passwords hashed with bcrypt
- HTTPS everywhere
- Don't forget indexes on (user_id, logged_at) for log tables