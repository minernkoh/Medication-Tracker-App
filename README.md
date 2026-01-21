# Medication Tracker App

Full-stack medication + appointment tracker with **Patient** and **Caregiver** workflows, **dose-level** (time-slot) logging, supply alerts, and adherence insights.

## Core features

- **Medication tracking**: create/update meds with schedules, instructions, and notes
- **Dose logs**: mark a dose as taken (per time-slot) and undo
- **Supply tracking**: quantity + recommended supply, with low/empty alerts
- **Appointments**: schedule appointments, track status (Scheduled/Today/Completed/Missed/Cancelled)
- **Caregiver mode**: link patients, view a combined daily schedule, appointments, and adherence summaries
- **Auth + onboarding**: JWT auth, onboarding tutorial (also accessible from Settings)
- **View-only patient mode**: when a caregiver is assigned, patient actions become read-only

## Tech stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Phosphor Icons
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT

## Getting started (dev)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Configure environment

Backend:

```bash
cp backend/env.example backend/.env
```

Minimum required in `backend/.env`:

- `MONGODB_URI`
- `JWT_SECRET`

Frontend (optional): override the Vite proxy target via `frontend/.env`:

```env
VITE_API_TARGET=http://127.0.0.1:5001
```

### Run

```bash
cd backend && npm run dev
```

```bash
cd frontend && npm run dev
```

- Backend default: `http://127.0.0.1:5001`
- Frontend default: `http://localhost:5173`
- In dev, the frontend calls the API via `/api/*` (proxied to the backend)

## Scripts

- Backend (`backend/`): `npm run dev`, `npm start`
- Frontend (`frontend/`): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run lint:fix`

## API (high level)

### Base + auth

- **Base**: `/api` (from the frontend in dev) or `http://127.0.0.1:5001`
- **Auth header**: everything except `/auth/*` requires `Authorization: Bearer <token>`
- **Source of truth**: route definitions live in `backend/routes/`

### Endpoints (overview)

- **Auth**: `POST /auth/signup`, `POST /auth/signin`
- **Users**: `GET /users/me`, `POST /users/me/change-password`, `PUT /users/:id`, `DELETE /users/:id`
- **Medications (current user)**:
  - `GET /medications` (supports `?date=YYYY-MM-DD`)
  - `POST /medications`, `GET|PUT|DELETE /medications/:id`
  - `PATCH /medications/:id/taken`, `PATCH /medications/:id/undo` (optionally pass `date` + `timeSlot`)
- **Appointments (current user)**: `GET /appointments`, `POST /appointments`, `GET|PUT|DELETE /appointments/:id`
- **Caregiver**:
  - `GET /caregiver/patients`, `POST /caregiver/patients`, `GET /caregiver/patients/:id`, `DELETE /caregiver/patients/:id`
  - `GET /caregiver/appointments`
  - `GET /caregiver/schedule?date=YYYY-MM-DD`
- **Patient-scoped (caregiver permissions)**:
  - `GET|POST /patients/:patientId/medications`, `PUT|DELETE /patients/:patientId/medications/:id`
  - `GET|POST /patients/:patientId/appointments`, `GET|PUT|DELETE /patients/:patientId/appointments/:id`

## Database schema (MongoDB/Mongoose)

Schema definitions live in `backend/models/`.

### `User`

- **Core fields**: `name`, `email`, `password` (hashed), `role` (`patient` | `caregiver`)
- **Relationships**:
  - **Patient → Caregiver(s)**: `caregiver` and/or `caregivers` (references `User`)
  - **Caregiver → Patients**: derived via reverse lookup (patients that reference the caregiver)

### `Medication`

- **Ownership**: `patient` (ref `User`)
- **Scheduling**: `timeOfDay` (legacy bucket or time), and/or `timesOfDay` (array of schedule slots)
- **Supply**: `dosage`, `unit`, `quantity`, `recommendSupply`
- **Lifecycle**: `isArchived`, `archivedAt`, `createdAt`
- **Daily status**: `status`, `taken`, `takenTime` (note: dose-level truth is in `MedicationLog`)

### `MedicationLog`

- **References**: `patient` (ref `User`), `medication` (ref `Medication`)
- **Slot-level intake**: `date` (YYYY-MM-DD), `timeSlot` (normalized), `takenAt` (timestamp)
- **Meaning**: one log row = one taken dose for a medication + time-slot on a date

### `Appointments`

- **Ownership**: `patient` (ref `User`)
- **Fields**: `title`, `date` (plus optional `dateDay`), `time`, `doctorName`, `location`, `notes`, `status`

## Sample data

JSON fixtures live in `patient_sampledata/` (useful for manual imports / API testing).
