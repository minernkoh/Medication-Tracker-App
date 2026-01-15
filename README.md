# Medication Tracker App

A full-stack web application for tracking medications, appointments, and health progress. Built with the MERN stack (MongoDB, Express, React, Node.js) to help users manage their medication schedules, view upcoming appointments, and monitor their health progress.

## 🚀 Features

### Core Functionality

- **Medication Management**: Track medications with dosage, frequency, and timing information
- **Appointment Tracking**: View and manage upcoming medical appointments
- **Daily Progress**: Monitor medication completion status throughout the day
- **Calendar Integration**: Weekly calendar view with date picker and today indicator
- **Supply Management**: Track medication inventory with refill reminders
- **Low Supply Alerts**: Visual indicators for medications running low

### Dual Mode Support

- **Personal Mode**: Individual medication and appointment tracking
- **Caregiver Mode**: Manage multiple patients with consolidated views
  - Patient overview dashboard
  - Aggregate medication schedules
  - Multi-patient appointment management

### Authentication & Onboarding

- **Sign Up/Login**: Email authentication with form validation
- **Account Types**: Choose between Patient or Caregiver accounts
- **Onboarding Tutorial**: Step-by-step guide for new users
- **Mode Switching**: Seamlessly switch between Personal and Caregiver modes

### Settings & Preferences

- **Account Management**: Profile display, password change
- **Privacy Controls**: Account deletion with data cleanup

### User Interface

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Interactive Components**: Hover states with glow effects, smooth transitions
- **Modern UI**: Clean design with Tailwind CSS and Phosphor Icons
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 🛠️ Technology Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for SPA navigation
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Phosphor Icons**: `@phosphor-icons/react` v2.1+ (use `Icon` suffix: `UserIcon`, `PillIcon`)

### Backend

- **Node.js**: JavaScript runtime environment
- **Express 5**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **CORS**: Cross-origin resource sharing support

### Design System

- **Typography**: Poppins font family (Regular, SemiBold, Bold)
- **Color Palette**:
  - Personal Mode: Blue (#155dfc)
  - Caregiver Mode: Rose/Pink (#da7488)
  - Status Colors: Success (green), Warning (amber), Danger (red)
- **Spacing**: Consistent rem-based scale (0.25rem to 5rem)
- **Button Glow Effects**: Subtle shadows on hover for interactive elements
- **Animations**: fadeIn, slideUp, slideDown, scaleIn

## 📁 Project Structure

```
Medication-Tracker-App/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── appointments.js          # Appointment logic
│   │   ├── auth.js                  # Authentication
│   │   ├── medications.js           # Medication CRUD
│   │   └── users.js                 # User management
│   ├── middleware/
│   │   ├── auth.js                  # Auth middleware
│   │   └── permissions.js           # Authorization
│   ├── models/
│   │   ├── Appointments.js          # Appointment model
│   │   ├── Medication.js            # Medication model
│   │   └── User.js                  # User model
│   ├── routes/
│   │   ├── appointments.js          # Appointment routes
│   │   ├── auth.js                  # Auth routes
│   │   ├── medications.js           # Medication routes
│   │   └── users.js                 # User routes
│   └── server.js                    # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # All reusable UI components
│   │   │   │   ├── buttons/         # Interactive button elements
│   │   │   │   │   ├── ActionButtons.jsx
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── CalendarDate.jsx
│   │   │   │   │   ├── MedicineDue.jsx
│   │   │   │   │   ├── MenuButtons.jsx
│   │   │   │   │   └── index.js
│   │   │   │   ├── AppointmentCard.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── MedicationSection.jsx
│   │   │   │   ├── OnboardingTutorial.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── index.js
│   │   │   ├── modals/              # Modal components
│   │   │   │   ├── AddAppointmentModal.jsx
│   │   │   │   ├── CaregiverAuthModal.jsx
│   │   │   │   └── index.js
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── caregiver/       # Caregiver mode pages
│   │   │   │   ├── patient/         # Patient mode pages
│   │   │   │   ├── AuthPage.jsx
│   │   │   │   ├── SettingsPage.jsx
│   │   │   │   └── index.js
│   │   │   └── index.js             # Central barrel export
│   │   ├── utils/
│   │   │   ├── colors.js            # Color tokens
│   │   │   └── designSystem.js      # Design tokens
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── tailwind.config.js           # Tailwind + design tokens
│   ├── vite.config.js
│   └── package.json
│
├── CHANGELOG.md                     # Version history
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)

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

4. **Set up environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/medication-tracker
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

### Running the Application

#### Development Mode

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

#### Production Build

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

## 🎨 Design System

### Semantic Color Tokens

Colors are defined in `frontend/src/utils/colors.js` and mirrored in `tailwind.config.js`:

| Token                | Value                   | Usage                  |
| -------------------- | ----------------------- | ---------------------- |
| `primary`            | `#155dfc`               | Personal mode actions  |
| `secondary`          | `#da7488`               | Caregiver mode actions |
| `text-primary`       | `#181818`               | Main text              |
| `text-secondary`     | `#646464`               | Subdued text           |
| `background-default` | `#ffffff`               | Page background        |
| `background-subtle`  | `#f9f9f9`               | Card backgrounds       |
| `border-default`     | `rgba(100,100,100,0.2)` | Default borders        |

### Button Variants

The `Button` component (`ui/buttons/Button.jsx`) supports these variants:

| Variant     | Use Case                      |
| ----------- | ----------------------------- |
| `primary`   | Main actions (blue glow)      |
| `secondary` | Caregiver actions (pink glow) |
| `success`   | Positive actions (green)      |
| `danger`    | Destructive actions (red)     |
| `outline`   | Secondary actions             |
| `ghost`     | Tertiary/subtle actions       |

### Action Buttons

The `ActionButtons` component (`ui/buttons/ActionButtons.jsx`) provides consistent edit/delete actions:

| Size   | Icon Size | Padding | Use Case             |
| ------ | --------- | ------- | -------------------- |
| `sm`   | 16px      | p-1.5   | Compact table rows   |
| `base` | 18px      | p-2     | Default (tables)     |
| `lg`   | 20px      | p-2.5   | Large interactive UI |

- **Edit**: Blue hover state (`hover:bg-blue-50`, `text-blue-500`)
- **Delete**: Red hover state (`hover:bg-red-50`, `text-red-500`)

### Typography

- **Font Family**: Poppins
- **Weights**: 400 (Regular), 600 (SemiBold), 700 (Bold)
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl+ (20-40px)

### Spacing & Sizing

All values use rem units for accessibility:

- **Spacing Scale**: xs (0.25rem) → 5xl (5rem)
- **Border Radius**: sm (4px) → 2xl (24px)
- **Icon Sizes**: xs (12px) → lg (32px)

## 🔌 API Endpoints

| Endpoint               | Method | Description        |
| ---------------------- | ------ | ------------------ |
| `/api/auth/login`      | POST   | User login         |
| `/api/auth/register`   | POST   | User registration  |
| `/api/users/:id`       | GET    | Get user profile   |
| `/api/medications`     | GET    | List medications   |
| `/api/medications/:id` | PUT    | Update medication  |
| `/api/appointments`    | GET    | List appointments  |
| `/api/appointments`    | POST   | Create appointment |

## 🧪 Development

### Code Style

- ES6+ JavaScript with React best practices
- Functional components with hooks
- JSDoc comments for component documentation
- Consistent naming: PascalCase components, camelCase functions

### State Management

- React `useState`/`useEffect` for local state
- `localStorage` for session persistence
- Props for component communication
- Callback functions for parent-child interaction

### Component Guidelines

1. **Keep components focused**: Single responsibility principle
2. **Use design tokens**: Import from `utils/colors.js` and `utils/designSystem.js`
3. **Mode-aware styling**: Use `getPrimaryColor(mode)` for mode-specific colors
4. **Reuse shared components**: `DataTable`, `MedicationSection`, `Button`

## 📄 License

MIT License - see LICENSE file for details.
