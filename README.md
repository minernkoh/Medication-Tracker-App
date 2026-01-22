# 💊 Medication Tracker App

> Full-stack medication and appointment tracker with **Patient** and **Caregiver** workflows, **dose-level** (time-slot) logging, supply alerts, and adherence insights.

![App Screenshot](./images/AppScreenshot.png)

---

## 📑 Table of Contents

- [Core Features](#-core-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Environment Variables](#-environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Sample Data](#-sample-data)
- [What We Learned](#what-we-learned)
- [Future Enhancements](#future-enhancements)

---

## ✨ Core Features

- **📋 Medication Tracking**: Create/update medications with schedules, instructions, and notes
- **✅ Dose Logs**: Mark doses as taken (per time-slot) with undo capability
- **📦 Supply Tracking**: Monitor quantity and recommended supply with low/empty alerts
- **📅 Appointments**: Schedule appointments and track status (Scheduled/Today/Completed/Missed/Cancelled)
- **👥 Caregiver Mode**: Link patients, view combined daily schedules, appointments, and adherence summaries
- **🔐 Authentication**: JWT-based authentication with onboarding tutorial (accessible from Settings)
- **👀 View-Only Patient Mode**: When a caregiver is assigned, patient actions become read-only

---

## Tech Stack

| Layer        | Technologies                                            |
| ------------ | ------------------------------------------------------- |
| **Frontend** | React, Vite, Tailwind CSS, React Router, Phosphor Icons |
| **Backend**  | Node.js, Express, MongoDB/Mongoose, JWT                 |
| **Database** | MongoDB (local or Atlas)                                |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Medication-Tracker-App
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

This repository includes example environment files. **Never commit your actual `.env` files.**

#### Backend Configuration

1. Copy the example file:

   ```bash
   cp backend/env.example backend/.env
   ```

2. Edit `backend/.env` and set the following **required** variables:

   ```env
   MONGODB_URI=mongodb://localhost:27017/medication-tracker
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medication-tracker

   JWT_SECRET=your-super-secret-jwt-key-here
   ```

#### Frontend Configuration

1. Copy the example file:

   ```bash
   cp frontend/env.example frontend/.env
   ```

2. Optionally override the API target (defaults to `http://127.0.0.1:5001`):
   ```env
   VITE_API_TARGET=http://127.0.0.1:5001
   ```

### Running the Application

1. **Start the backend server** (from `backend/` directory):

   ```bash
   npm run dev
   ```

   Backend will run on `http://127.0.0.1:5001`

2. **Start the frontend development server** (from `frontend/` directory):

   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

3. **Access the application**:
   - Open your browser to `http://localhost:5173`
   - In development, the frontend proxies API requests via `/api/*` to the backend

---

## 🔧 Environment Variables

This project uses environment variables for configuration. Example files are provided in `backend/env.example` and `frontend/env.example`. **Never commit your actual `.env` files to version control.**

### Backend Environment Variables

| Variable      | Required | Default     | Description                                |
| ------------- | -------- | ----------- | ------------------------------------------ |
| `PORT`        | ❌       | `5001`      | Server port number                         |
| `HOST`        | ❌       | `127.0.0.1` | Server host address                        |
| `MONGODB_URI` | ✅       | -           | MongoDB connection string (local or Atlas) |
| `JWT_SECRET`  | ✅       | -           | Secret key for signing JWT tokens          |

### Frontend Environment Variables

| Variable          | Required | Default                   | Description                           |
| ----------------- | -------- | ------------------------- | ------------------------------------- |
| `VITE_API_URL`    | ❌       | `"/api"`                  | API base URL path                     |
| `VITE_API_TARGET` | ❌       | `"http://127.0.0.1:5001"` | Backend server URL for Vite dev proxy |

---

## Project Structure

```
Medication-Tracker-App/
├── backend/                    # Express API server
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers & business logic
│   ├── middleware/             # Authentication & permissions
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── utils/                  # Shared helper functions
│   ├── server.js               # Entry point
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── features/       # Feature-specific components
│   │   │   ├── layout/         # Layout components (Sidebar, etc.)
│   │   │   ├── modals/         # Modal dialogs
│   │   │   ├── pages/          # Page components
│   │   │   └── ui/             # Reusable UI components
│   │   ├── contexts/           # React contexts (state management)
│   │   ├── utils/              # Utility functions
│   │   ├── theme/              # Design tokens
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   └── package.json
│
├── images/                     # Screenshots and assets
├── patient_sampledata/         # JSON fixtures for testing
└── README.md
```

---

## 🔌 API Documentation

### Base Configuration

- **Base URL**: `/api` (from frontend in dev) or `http://127.0.0.1:5001`
- **Authentication**: All endpoints except `/auth/*` require `Authorization: Bearer <token>` header
- **Route Definitions**: Source of truth lives in `backend/routes/`

### Endpoints Overview

#### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user

#### Users

- `GET /users/me` - Get current user profile
- `POST /users/me/change-password` - Change password
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Medications (Current User)

- `GET /medications?date=YYYY-MM-DD` - Get medications (optional date filter)
- `POST /medications` - Create medication
- `GET /medications/:id` - Get medication by ID
- `PUT /medications/:id` - Update medication
- `DELETE /medications/:id` - Delete medication
- `PATCH /medications/:id/taken` - Mark dose as taken (optional `date` + `timeSlot`)
- `PATCH /medications/:id/undo` - Undo dose (optional `date` + `timeSlot`)

#### Appointments (Current User)

- `GET /appointments` - Get appointments
- `POST /appointments` - Create appointment
- `GET /appointments/:id` - Get appointment by ID
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

#### Caregiver

- `GET /caregiver/patients` - Get all linked patients
- `POST /caregiver/patients` - Link a patient
- `GET /caregiver/patients/:id` - Get patient details
- `DELETE /caregiver/patients/:id` - Unlink a patient
- `GET /caregiver/appointments` - Get all patient appointments
- `GET /caregiver/schedule?date=YYYY-MM-DD` - Get combined schedule for date

#### Patient-Scoped (Caregiver Permissions)

- `GET /patients/:patientId/medications` - Get patient medications
- `POST /patients/:patientId/medications` - Create medication for patient
- `PUT /patients/:patientId/medications/:id` - Update patient medication
- `DELETE /patients/:patientId/medications/:id` - Delete patient medication
- `GET /patients/:patientId/appointments` - Get patient appointments
- `POST /patients/:patientId/appointments` - Create appointment for patient
- `GET /patients/:patientId/appointments/:id` - Get patient appointment
- `PUT /patients/:patientId/appointments/:id` - Update patient appointment
- `DELETE /patients/:patientId/appointments/:id` - Delete patient appointment

---

## 🗄️ Database Schema

Schema definitions live in `backend/models/`. All models use MongoDB with Mongoose ODM.

### User

Stores both patient and caregiver accounts. Password hashing happens automatically on save.

| Field        | Type            | Required | Description                                       |
| ------------ | --------------- | -------- | ------------------------------------------------- |
| `name`       | String          | ✅       | User's full name                                  |
| `email`      | String          | ✅       | Unique email address                              |
| `password`   | String          | ✅       | Hashed password (bcrypt)                          |
| `role`       | String          | ✅       | Enum: `"patient"` \| `"caregiver"`                |
| `caregivers` | Array[ObjectId] | ❌       | Array of linked caregiver user IDs (preferred)    |
| `caregiver`  | ObjectId        | ❌       | Legacy single caregiver reference (default: null) |
| `createdAt`  | Date            | Auto     | Timestamp                                         |
| `updatedAt`  | Date            | Auto     | Timestamp                                         |

**Indexes**: `{ email: 1, role: 1 }` (unique)

**Relationships**:

- Patient → Caregiver(s): `caregiver` and/or `caregivers` (references `User`)
- Caregiver → Patients: Derived via reverse lookup (patients that reference the caregiver)

---

### Medication

Stores medication definitions for patients. Supports single or multiple daily schedules.

| Field             | Type          | Required | Default    | Description                                                                                                                             |
| ----------------- | ------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `activeFrom`      | Date          | ❌       | null       | Date medication becomes active (indexed)                                                                                                |
| `name`            | String        | ✅       | -          | Medication name                                                                                                                         |
| `dosage`          | Number        | ✅       | -          | Dosage amount                                                                                                                           |
| `unit`            | String        | ❌       | `"pills"`  | Unit of measurement                                                                                                                     |
| `type`            | String        | ❌       | `"pills"`  | Enum: `pills`, `tablets`, `capsules`, `liquid`, `drops`, `spray`, `injection`, `patch`, `cream`, `ointment`, `gel`, `powder`, `inhaler` |
| `status`          | String        | ❌       | `"supply"` | Enum: `"pending"`, `"taken"`, `"supply"`                                                                                                |
| `isArchived`      | Boolean       | ❌       | false      | Soft delete flag (indexed)                                                                                                              |
| `archivedAt`      | Date          | ❌       | null       | Archive timestamp                                                                                                                       |
| `timeOfDay`       | String        | ❌       | null       | Single time slot (legacy): `"morning"` \| `"afternoon"` \| `"night"` \| `"HH:MM"`                                                       |
| `timesOfDay`      | Array[String] | ❌       | undefined  | Multiple time slots array                                                                                                               |
| `taken`           | Boolean       | ❌       | false      | Daily taken status (convenience field)                                                                                                  |
| `takenTime`       | String        | ❌       | -          | Display time (e.g., "9:00 AM")                                                                                                          |
| `frequency`       | String        | ❌       | -          | Frequency description (e.g., "2 times per day")                                                                                         |
| `quantity`        | Number        | ❌       | -          | Current amount remaining                                                                                                                |
| `recommendSupply` | Number        | ❌       | -          | Baseline for supply ratio calculations                                                                                                  |
| `initialQuantity` | Number        | ❌       | -          | Baseline for supply percentage                                                                                                          |
| `additionalInfo`  | String        | ❌       | -          | Additional notes (e.g., "Before Meal")                                                                                                  |
| `pillColor`       | String        | ❌       | -          | Hex color code for UI                                                                                                                   |
| `instructions`    | Array[String] | ❌       | -          | Array of instruction strings                                                                                                            |
| `patient`         | ObjectId      | ❌       | -          | Reference to `User` (patient)                                                                                                           |
| `createdBy`       | ObjectId      | ❌       | -          | Reference to `User` (creator)                                                                                                           |
| `createdAt`       | Date          | Auto     | -          | Timestamp                                                                                                                               |
| `updatedAt`       | Date          | Auto     | -          | Timestamp                                                                                                                               |

**Note**: Dose-level truth is tracked in `MedicationLog`. This model stores convenience fields for daily status.

---

### MedicationLog

The app's intake history table. One record = one taken dose for a medication + time-slot on a date.

| Field        | Type     | Required | Default  | Description                         |
| ------------ | -------- | -------- | -------- | ----------------------------------- |
| `medication` | ObjectId | ✅       | -        | Reference to `Medication`           |
| `patient`    | ObjectId | ✅       | -        | Reference to `User` (patient)       |
| `date`       | String   | ✅       | -        | Date in YYYY-MM-DD format (indexed) |
| `timeSlot`   | String   | ✅       | -        | Normalized time slot identifier     |
| `takenAt`    | Date     | ❌       | Date.now | Timestamp when dose was logged      |
| `createdAt`  | Date     | Auto     | -        | Timestamp                           |
| `updatedAt`  | Date     | Auto     | -        | Timestamp                           |

**Indexes**:

- `{ medication: 1, date: 1, timeSlot: 1 }` (unique) - Prevents duplicate logs for same slot
- `{ date: 1 }` (indexed)

---

### Appointment

Stores appointments for patients with timezone-safe date handling.

| Field        | Type     | Required | Default       | Description                                                   |
| ------------ | -------- | -------- | ------------- | ------------------------------------------------------------- |
| `title`      | String   | ✅       | -             | Appointment title                                             |
| `doctorName` | String   | ❌       | -             | Doctor's name                                                 |
| `location`   | String   | ❌       | -             | Appointment location                                          |
| `date`       | Date     | ❌       | -             | Full date/time                                                |
| `dateDay`    | String   | ❌       | -             | Timezone-safe day key (YYYY-MM-DD) for UI filtering (indexed) |
| `time`       | String   | ❌       | -             | Time string                                                   |
| `notes`      | String   | ❌       | -             | Additional notes                                              |
| `status`     | String   | ❌       | `"Scheduled"` | Enum: `"Scheduled"`, `"Completed"`, `"Missed"`, `"Cancelled"` |
| `patient`    | ObjectId | ❌       | -             | Reference to `User` (patient)                                 |
| `createdBy`  | ObjectId | ❌       | -             | Reference to `User` (creator)                                 |
| `createdAt`  | Date     | Auto     | -             | Timestamp                                                     |
| `updatedAt`  | Date     | Auto     | -             | Timestamp                                                     |

**Indexes**: `{ dateDay: 1 }` (indexed)

---

## 📊 Sample Data

JSON fixtures are available in `patient_sampledata/` for manual imports and API testing:

- `1-users.json` - Sample user accounts
- `2-medications.json` - Sample medications
- `3-medicationlogs.json` - Sample medication logs
- `4-appointments.json` - Sample appointments

---

## What We Learned

- **Dose-level logging matters**: Tracking “taken” per time-slot per day avoids ambiguity from “one med = one status”.
- **Permissions are product features**: Caregiver vs patient workflows required explicit authorization rules and UI state that matches them (e.g., view-only patient mode).
- **Date/time normalization is essential**: Consistent YYYY-MM-DD format + normalized time slots reduced edge cases across UI, API, and analytics.
- **Keep business logic close to the domain**: Shared utilities (schedule generation, adherence calculations) prevented duplicated logic across components/controllers.

---

## Future Enhancements

- [ ] **Testing Suite**: Unit and integration tests for auth, permissions, and schedule/adherence logic
- [ ] **Notifications**: Email/push reminders for medication doses and appointments
- [ ] **Recurring Appointments**: Support for repeating appointments
- [ ] **Enhanced Analytics**: Weekly/monthly adherence trends, streaks, and detailed reports
- [ ] **Export Functionality**: PDF/CSV export of medication logs and adherence reports
- [ ] **Mobile App**: React Native version for iOS and Android
