# Medication Tracker App

Full-stack web app for tracking medications and appointments, with **patient** and **caregiver** modes.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Database schemas](#database-schemas)
- [API overview](#api-overview)
- [Scripts](#scripts)
- [Getting started (dev)](#getting-started-dev)
- [What we learned](#what-we-learned)
- [License](#license)

## Features

- **Medication tracking**: create/update meds with schedules and inventory (low-supply alerts)
- **Medication logs**: mark a dose as taken and undo
- **Appointments**: create/update upcoming appointments
- **Caregiver mode**: link patients, see consolidated schedules/appointments and adherence summaries
- **Auth + onboarding**: JWT auth, onboarding tutorial accessible from Settings

## Tech stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Phosphor Icons
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT, Helmet, rate limiting

## Database schemas

This project uses **MongoDB** with **Mongoose**. Collections below reflect the app’s Mongoose models (plus Mongoose-managed `createdAt` / `updatedAt` timestamps where enabled).

### `users` (User)

- **Purpose**: Stores both patient and caregiver accounts.
- **Indexes**:
  - Unique: `email + role` (`{ email: 1, role: 1 }`)

| Field        | Type                       | Required | Default | Notes                                               |
| ------------ | -------------------------- | -------- | ------- | --------------------------------------------------- |
| `name`       | `String`                   | ✅       | -       |                                                     |
| `email`      | `String`                   | ✅       | -       | Unique per `role`                                   |
| `password`   | `String`                   | ✅       | -       | Stored as a bcrypt hash (hashed on save)            |
| `role`       | `"patient" \| "caregiver"` | ✅       | -       |                                                     |
| `caregivers` | `ObjectId[]` → `User`      | -        | `[]`    | Preferred caregiver linkage (many-to-many)          |
| `caregiver`  | `ObjectId` → `User`        | -        | `null`  | Legacy single caregiver reference (still supported) |

### `medications` (Medication)

- **Purpose**: Medication definitions for a patient (schedule + supply metadata).
- **Notes**:
  - Schedule supports either `timeOfDay` (single) or `timesOfDay` (multiple).
  - Intake history is tracked in `medicationlogs` (this model also contains convenience “taken” fields).
  - Soft delete/archive uses `isArchived` + `archivedAt`.
- **Indexes**:
  - `isArchived` is indexed.

| Field             | Type                               | Required | Default     | Notes                                                                                         |
| ----------------- | ---------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------- |
| `name`            | `String`                           | ✅       | -           |                                                                                               |
| `dosage`          | `Number`                           | ✅       | -           |                                                                                               |
| `unit`            | `String`                           | -        | `"pills"`   |                                                                                               |
| `type`            | `String` (enum)                    | -        | `"pills"`   | `pills/tablets/capsules/liquid/drops/spray/injection/patch/cream/ointment/gel/powder/inhaler` |
| `status`          | `"pending" \| "taken" \| "supply"` | -        | `"supply"`  |                                                                                               |
| `isArchived`      | `Boolean`                          | -        | `false`     | Indexed                                                                                       |
| `archivedAt`      | `Date \| null`                     | -        | `null`      |                                                                                               |
| `timeOfDay`       | `String \| null`                   | -        | `null`      | Validated (`morning/afternoon/night` or `HH:MM` 24-hour)                                      |
| `timesOfDay`      | `String[]`                         | -        | `undefined` | Each entry validated like `timeOfDay`                                                         |
| `taken`           | `Boolean`                          | -        | `false`     | Convenience flag (per-day state is in `MedicationLog`)                                        |
| `takenTime`       | `String`                           | -        | -           | Example: `"9:00 AM"`                                                                          |
| `frequency`       | `String`                           | -        | -           | Example: `"2 times per day"`                                                                  |
| `quantity`        | `Number`                           | -        | -           | Current remaining amount                                                                      |
| `recommendSupply` | `Number`                           | -        | -           | Baseline for supply ratio calculations                                                        |
| `initialQuantity` | `Number`                           | -        | -           | Baseline for supply %                                                                         |
| `additionalInfo`  | `String`                           | -        | -           | Example: `"Before Meal"`                                                                      |
| `pillColor`       | `String`                           | -        | -           | Hex color code                                                                                |
| `instructions`    | `String[]`                         | -        | -           |                                                                                               |
| `patient`         | `ObjectId` → `User`                | -        | -           | Patient who owns the medication                                                               |
| `createdBy`       | `ObjectId` → `User`                | -        | -           | Creator (patient or caregiver)                                                                |
| `createdAt`       | `Date`                             | -        | -           | Mongoose timestamp                                                                            |
| `updatedAt`       | `Date`                             | -        | -           | Mongoose timestamp                                                                            |

### `medicationlogs` (MedicationLog)

- **Purpose**: Intake history. One record = patient took a medication for a given `date` and `timeSlot`.
- **Indexes**:
  - Indexed: `date`
  - Unique: `medication + date + timeSlot` (`{ medication: 1, date: 1, timeSlot: 1 }`) to prevent duplicates

| Field        | Type                      | Required | Default    | Notes                                                        |
| ------------ | ------------------------- | -------- | ---------- | ------------------------------------------------------------ |
| `medication` | `ObjectId` → `Medication` | ✅       | -          |                                                              |
| `patient`    | `ObjectId` → `User`       | ✅       | -          |                                                              |
| `date`       | `String`                  | ✅       | -          | Day key (commonly `YYYY-MM-DD`)                              |
| `timeSlot`   | `String`                  | ✅       | -          | Schedule slot identifier (e.g. `morning` or a specific time) |
| `takenAt`    | `Date`                    | -        | `Date.now` | When the dose was recorded                                   |
| `createdAt`  | `Date`                    | -        | -          | Mongoose timestamp                                           |
| `updatedAt`  | `Date`                    | -        | -          | Mongoose timestamp                                           |

### `appointments` (Appointment)

- **Purpose**: Patient appointments.
- **Indexes**:
  - Indexed: `dateDay`

| Field        | Type                                                    | Required | Default       | Notes                                                           |
| ------------ | ------------------------------------------------------- | -------- | ------------- | --------------------------------------------------------------- |
| `title`      | `String`                                                | ✅       | -             |                                                                 |
| `doctorName` | `String`                                                | -        | -             |                                                                 |
| `location`   | `String`                                                | -        | -             |                                                                 |
| `date`       | `Date`                                                  | -        | -             |                                                                 |
| `dateDay`    | `String`                                                | -        | -             | Timezone-safe day key for UI/filtering (stored as `YYYY-MM-DD`) |
| `time`       | `String`                                                | -        | -             |                                                                 |
| `notes`      | `String`                                                | -        | -             |                                                                 |
| `status`     | `"Scheduled" \| "Completed" \| "Missed" \| "Cancelled"` | -        | `"Scheduled"` |                                                                 |
| `patient`    | `ObjectId` → `User`                                     | -        | -             | Patient the appointment belongs to                              |
| `createdBy`  | `ObjectId` → `User`                                     | -        | -             | Creator (patient or caregiver)                                  |
| `createdAt`  | `Date`                                                  | -        | -             | Mongoose timestamp                                              |
| `updatedAt`  | `Date`                                                  | -        | -             | Mongoose timestamp                                              |

## API overview

Base URL:

- **From the frontend (dev)**: `/api`
- **Directly**: `http://127.0.0.1:5001`

Auth:

- `POST /auth/signup`
- `POST /auth/signin`

Users:

- `GET /users/me`
- `POST /users/me/change-password`
- `PUT /users/:id`
- `PUT /users/:id/assign-caregiver`
- `DELETE /users/:id`

Medications:

- `GET /medications` (current user)
- `GET /medications/today`
- `GET /medications/supply`
- `GET /medications/date/:date` (date format: `YYYY-MM-DD`)
- `POST /medications`
- `GET|PUT|DELETE /medications/:id`
- `PATCH /medications/:id/taken`
- `PATCH /medications/:id/undo`
- Patient-scoped (caregiver permissions):
  - `GET|POST /patients/:patientId/medications`
  - `PUT|DELETE /patients/:patientId/medications/:id`

Appointments:

- `GET /appointments` (current user)
- `POST /appointments`
- `GET|PUT|DELETE /appointments/:id`
- Patient-scoped:
  - `GET|POST /patients/:patientId/appointments`
  - `GET|PUT|DELETE /patients/:patientId/appointments/:id`

Caregiver:

- `GET /caregiver/patients`
- `POST /caregiver/patients`
- `GET /caregiver/patients/:id`
- `DELETE /caregiver/patients/:id`
- `GET /caregiver/appointments`
- `GET /caregiver/schedule?date=YYYY-MM-DD`

Notes:

- All endpoints except `/auth/*` require `Authorization: Bearer <token>`.

## Scripts

- Backend (from `backend/`): `npm run dev`, `npm start`
- Frontend (from `frontend/`): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run lint:fix`

## Getting started (dev)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment variables

Backend:

```bash
cp backend/env.example backend/.env
```

Required values in `backend/.env`:

- `MONGODB_URI`
- `JWT_SECRET`

Optional:

- `PORT` (defaults to `5001`)
- `HOST` (defaults to `127.0.0.1`)

Backend `.env` template:

```env
PORT=5001
HOST=127.0.0.1
MONGODB_URI=mongodb://127.0.0.1:27017/medtrack
JWT_SECRET={random string here}
```

Frontend (optional): create `frontend/.env` to override API/proxy settings:

```bash
cp frontend/env.example frontend/.env
```

```env
VITE_API_URL=/api
VITE_API_TARGET=http://127.0.0.1:5001
```

### Run

```bash
cd backend && npm run dev
```

```bash
cd frontend && npm run dev
```

- Backend runs on `http://127.0.0.1:5001` by default
- Frontend runs on `http://localhost:5173`
- In dev, the frontend calls the API via `/api/*` and Vite proxies to the backend (stripping the `/api` prefix)

## What we learned

- **Modeling relationships in MongoDB**: representing patient/caregiver links with `ObjectId` refs (including a legacy single-caregiver field) while keeping queries straightforward.
- **Data integrity with indexes**: using compound unique indexes (e.g., `email + role`, `medication + date + timeSlot`) to prevent duplicates without extra app logic.
- **Timezone-safe date handling**: storing a canonical day key (`YYYY-MM-DD` like `dateDay`) for UI filtering to avoid timezone edge cases.
- **Separating “definitions” from “history”**: keeping medication schedules in `Medication` and intake events in `MedicationLog` to support adherence views and undo behavior cleanly.
- **Role-based API design**: protecting routes with JWT auth + permission middleware and adding patient-scoped endpoints for caregiver workflows.
- **Reusable UI patterns**: building common components (modals, forms, toasts, tables) and shared state via React contexts to keep feature pages consistent.

## License

No license file is currently included in this repository.
