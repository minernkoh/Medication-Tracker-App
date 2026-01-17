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
- **Onboarding Tutorial**: Step-by-step guide for new users (can be skipped and accessed later from Settings)
- **Mode Switching**: Seamlessly switch between Personal and Caregiver modes

### Settings & Preferences

- **Account Management**: Profile display, password change
- **Privacy Controls**: Account deletion with data cleanup
- **Help & Support**: Access tutorial from Settings
- **Logout Confirmation**: Prevents accidental logouts with confirmation dialog

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
- **dotenv**: Environment variable management
- **JWT**: JSON Web Token authentication (via middleware)

### Design System

The design system is centralized in `frontend/tailwind.config.js` as a **single source of truth**:

- **Typography**: Poppins font family (Regular, SemiBold, Bold)
- **Color System**: Centralized color tokens exported from `tailwind.config.js`
  - Personal Mode: Blue (#155dfc)
  - Caregiver Mode: Rose/Pink (#da7488)
  - Semantic tokens: text, icon, background, border with variants
  - Status colors: success, warning, danger with hover/light variants
  - Patient colors: pink, blue, green, amber, purple (for caregiver mode)
  - All components import colors directly from the config
  - Utility functions: `getGradientBackground()`, `getBoxShadow()`, `hexToRgba()`
- **Spacing**: Consistent rem-based scale (0.25rem to 5rem)
- **Button Glow Effects**: CSS-only hover states using Tailwind classes
- **Animations**: fadeIn, slideUp, slideDown, scaleIn
- **Z-Index Scale**: Organized layering (dropdown: 10, modal: 40, tooltip: 60)

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
│   ├── server.js                    # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── ActionButtons.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── CalendarDateButton.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── FormField.jsx
│   │   │   │   ├── GradientBackground.jsx
│   │   │   │   ├── LoadingState.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── SectionHeader.jsx
│   │   │   │   ├── SideMenuButtons.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── index.js
│   │   │   ├── features/            # Feature-specific components
│   │   │   │   ├── AppointmentCard.jsx
│   │   │   │   ├── MedicationSection.jsx
│   │   │   │   ├── OnboardingTutorial.jsx
│   │   │   │   ├── PendingMedicine.jsx
│   │   │   │   └── index.js
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── index.js
│   │   │   ├── modals/             # Modal components
│   │   │   │   ├── AddAppointmentModal.jsx
│   │   │   │   ├── AddMedicationModal.jsx
│   │   │   │   ├── CaregiverAuthModal.jsx
│   │   │   │   ├── EditMedicationModal.jsx
│   │   │   │   └── index.js
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── caregiver/      # Caregiver mode pages
│   │   │   │   │   ├── CaregiverAppointmentsPage.jsx
│   │   │   │   │   ├── CaregiverDashboard.jsx
│   │   │   │   │   ├── PatientDetailPage.jsx
│   │   │   │   │   ├── PatientsPage.jsx
│   │   │   │   │   └── index.js
│   │   │   │   ├── patient/        # Patient mode pages
│   │   │   │   │   ├── AppointmentsPage.jsx
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── MedicationPage.jsx
│   │   │   │   │   └── index.js
│   │   │   │   ├── AuthPage.jsx
│   │   │   │   ├── NotFoundPage.jsx
│   │   │   │   ├── SettingsPage.jsx
│   │   │   │   └── index.js
│   │   │   └── index.js            # Central barrel export
│   │   ├── contexts/
│   │   │   └── ErrorContext.jsx    # Error handling context
│   │   ├── utils/
│   │   │   ├── apiErrorHandler.js
│   │   │   ├── dateUtils.js
│   │   │   ├── emptyStates.jsx
│   │   │   ├── medicationColors.js
│   │   │   ├── modeUtils.js
│   │   │   ├── storageUtils.js
│   │   │   ├── timeUtils.js
│   │   │   ├── typography.js
│   │   │   ├── validation.js
│   │   │   └── index.js
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── tailwind.config.js          # Tailwind + design tokens
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── package.json
│
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

   **Note:** For production, use a strong, randomly generated JWT secret. You can generate one using:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
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

### Architecture

The design system follows a **single source of truth** pattern. All design tokens are defined in `frontend/tailwind.config.js`:

- **Color tokens** are exported and imported directly in components
- **No duplicate color definitions** - all colors reference the config
- **Tailwind classes** automatically use the same tokens via the config
- **Consistent design language** across all components

### Semantic Color Tokens

Colors are defined and exported from `tailwind.config.js`:

| Token                | Value                   | Usage                   |
| -------------------- | ----------------------- | ----------------------- |
| `primary.DEFAULT`    | `#155dfc`               | Personal mode actions   |
| `primary.hover`      | `#1350e0`               | Personal hover state    |
| `primary.light`      | `#e8f0fe`               | Personal light variant  |
| `secondary.DEFAULT`  | `#da7488`               | Caregiver mode actions  |
| `secondary.hover`    | `#c86478`               | Caregiver hover state   |
| `secondary.light`    | `#fce8ec`               | Caregiver light variant |
| `text.primary`       | `#181818`               | Main text               |
| `text.secondary`     | `#646464`               | Subdued text            |
| `icon.primary`       | `#181818`               | Default icon color      |
| `icon.secondary`     | `#646464`               | Secondary icon color    |
| `background.default` | `#ffffff`               | Page background         |
| `background.subtle`  | `#f9f9f9`               | Card backgrounds        |
| `background.hover`   | `#f9f9f9`               | Hover backgrounds       |
| `border.default`     | `rgba(100,100,100,0.2)` | Default borders         |
| `border.subtle`      | `rgba(100,100,100,0.1)` | Subtle borders          |

**Usage in Components:**

```javascript
import { colors } from "../../../tailwind.config.js";

// Use in JSX (e.g., for icon colors)
<Icon color={colors.icon.primary} />;
```

**Usage in Tailwind Classes:**

```jsx
// Tailwind automatically uses the same tokens
<div className="bg-primary text-text-onPrimary" />
```

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

### Authentication

| Endpoint       | Method | Description       |
| -------------- | ------ | ----------------- |
| `/auth/signup` | POST   | User registration |
| `/auth/signin` | POST   | User login        |

### Users

| Endpoint                      | Method | Description                 |
| ----------------------------- | ------ | --------------------------- |
| `/users/me`                   | GET    | Get current user profile    |
| `/users/:id`                  | PUT    | Update user profile         |
| `/users/:id/assign-caregiver` | PUT    | Assign caregiver to patient |

### Medications

| Endpoint                               | Method | Description                   |
| -------------------------------------- | ------ | ----------------------------- |
| `/medications/:id`                     | GET    | Get medication by ID          |
| `/medications/:id`                     | PUT    | Update medication             |
| `/medications/:id`                     | DELETE | Delete medication             |
| `/patients/:patientId/medications`     | GET    | List patient medications      |
| `/patients/:patientId/medications`     | POST   | Create medication for patient |
| `/patients/:patientId/medications/:id` | PUT    | Update patient medication     |
| `/patients/:patientId/medications/:id` | DELETE | Delete patient medication     |

### Appointments

| Endpoint                                | Method | Description                    |
| --------------------------------------- | ------ | ------------------------------ |
| `/appointments/:id`                     | GET    | Get appointment by ID          |
| `/appointments/:id`                     | PUT    | Update appointment             |
| `/appointments/:id`                     | DELETE | Delete appointment             |
| `/patients/:patientId/appointments`     | GET    | List patient appointments      |
| `/patients/:patientId/appointments`     | POST   | Create appointment for patient |
| `/patients/:patientId/appointments/:id` | GET    | Get patient appointment by ID  |
| `/patients/:patientId/appointments/:id` | PUT    | Update patient appointment     |
| `/patients/:patientId/appointments/:id` | DELETE | Delete patient appointment     |

**Note:** All endpoints (except authentication) require JWT token authentication via the `Authorization` header.

## 🧪 Development

### Code Style

- ES6+ JavaScript with React best practices
- Functional components with hooks
- JSDoc comments for component documentation
- Consistent naming: PascalCase components, camelCase functions

### State Management

- React `useState`/`useEffect` for local state
- `localStorage` for session persistence (via `storageUtils.js`)
- React Context API (`ErrorContext`) for global error handling
- Props for component communication
- Callback functions for parent-child interaction

### Component Guidelines

1. **Keep components focused**: Single responsibility principle
2. **Use design tokens from config**:
   - Import colors directly: `import { colors } from "../../../tailwind.config.js"`
   - Use Tailwind classes when possible (they reference the same tokens)
   - Never hardcode color values - always use tokens
3. **CSS-only hover states**: Use Tailwind `hover:` variants, not JS `useState`
4. **Accessible components**: Use semantic HTML (`<button>` not `<div onClick>`)
5. **Mode-aware styling**: Use Tailwind classes like `bg-primary` vs `bg-secondary`
6. **Reuse shared components**: `DataTable`, `MedicationSection`, `Button`, `ActionButtons`
7. **Error handling**: Use `ErrorContext` for global error management
8. **Loading states**: Use `LoadingState` component for async operations
9. **Empty states**: Use `EmptyState` component with appropriate messaging

### Design System Best Practices

- ✅ **Single source of truth**: All design tokens in `tailwind.config.js`
- ✅ **Import colors directly**: `import { colors } from "../tailwind.config.js"`
- ✅ **Use Tailwind classes first**: Prefer Tailwind utility classes over inline styles
- ✅ **Consistent spacing**: Use the defined rem-based spacing scale
- ✅ **Semantic tokens**: Use semantic names (e.g., `text.primary` not `#181818`)
- ❌ **Don't hardcode colors**: Always use tokens from the config
- ❌ **Don't duplicate definitions**: Reference the config, don't redefine

## 📚 Documentation

- **README.md**: This file - project overview and setup

**Note:** Additional documentation files (DESIGN_EVALUATION.md, COMPONENT_ORGANIZATION.md, etc.) may exist in the repository. Check the root directory for available documentation.

## 🎯 Key Features & Improvements

**Recent Improvements:**

- ✅ Onboarding flow: Skip option and Settings access
- ✅ Medication management: Prominent CTAs and empty states
- ✅ Appointment management: Improved editing/deletion flows with confirmation dialogs
- ✅ Error recovery: Custom 404 page and enhanced error handling
- ✅ Logout flow: Confirmation dialog to prevent accidental logouts
- ✅ Settings organization: Logically grouped sections
- ✅ Design token system: Centralized color and design tokens in Tailwind config
- ✅ Component organization: Clear separation between UI, features, layout, and pages

## 🧪 Testing

Currently, the project does not include automated tests. To add testing:

1. **Backend**: Consider adding Jest or Mocha for API endpoint testing
2. **Frontend**: Consider adding React Testing Library for component testing
3. **E2E**: Consider adding Cypress or Playwright for end-to-end testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.
