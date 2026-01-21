# Medication Tracker App

Full-stack web app for tracking medications and appointments, with **patient** and **caregiver** modes.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started (dev)](#getting-started-dev)
- [API overview](#api-overview)
- [Scripts](#scripts)
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

Frontend (optional): override the Vite dev proxy target by creating `frontend/.env`:

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

- Backend runs on `http://127.0.0.1:5001` by default
- Frontend runs on `http://localhost:5173`
- In dev, the frontend calls the API via `/api/*` and Vite proxies to the backend (stripping the `/api` prefix)

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

## License

No license file is currently included in this repository.
