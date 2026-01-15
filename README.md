# Medication Tracker App

A full-stack web application for tracking medications, appointments, and health progress. Built with the MERN stack (MongoDB, Express, React, Node.js) to help users manage their medication schedules, view upcoming appointments, and monitor their health progress.

## 🚀 Features

### Core Functionality

- **Medication Management**: Track medications with dosage, frequency, and timing information
- **Appointment Tracking**: View and manage upcoming medical appointments
- **Daily Progress**: Monitor medication completion status throughout the day
- **Calendar Integration**: Weekly calendar view for medication scheduling
- **Dual Modes**: Personal and Caregiver modes for different user types

### User Interface

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Interactive Components**: Hover states, selections, and smooth transitions
- **Modern UI**: Clean design with Tailwind CSS and Phosphor Icons
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 🛠️ Technology Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with semantic color tokens
- **Phosphor Icons**: `@phosphor-icons/react` v2.1+ (use `Icon` suffix: `UserIcon`, `PillIcon`)
- **Semantic Design Tokens**: Centralized color system in `utils/colors.js`

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
  - Caregiver Mode: Dark Pink (#da7488)
  - Neutral: Grey scale for backgrounds and text
- **Spacing**: Consistent 4px, 8px, 16px, 24px grid system

## 📁 Project Structure

```
Medication-Tracker-App/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── controllers/
│   │   ├── appointments.js    # Appointment business logic
│   │   ├── auth.js            # Authentication logic
│   │   ├── medications.js     # Medication CRUD operations
│   │   └── users.js           # User management
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── permissions.js     # Authorization middleware
│   ├── models/
│   │   ├── Appointments.js    # Appointment data model
│   │   ├── Medication.js      # Medication data model
│   │   └── User.js            # User data model
│   ├── routes/
│   │   ├── appointments.js    # Appointment API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── medications.js     # Medication API routes
│   │   └── users.js           # User API routes
│   └── server.js              # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── buttons/
│   │   │   │   ├── CalendarDate.jsx    # Date picker component
│   │   │   │   ├── MedicineDue.jsx     # Medication card component
│   │   │   │   └── SideMenu.jsx        # Navigation menu button
│   │   │   ├── AppointmentCard.jsx     # Appointment display card
│   │   │   ├── Dashboard.jsx           # Main dashboard page
│   │   │   └── Sidebar.jsx             # Navigation sidebar
│   │   ├── utils/
│   │   │   └── colors.js               # Semantic color tokens
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── index.html                      # HTML template
│   ├── tailwind.config.js              # Tailwind config with design tokens
│   ├── vite.config.js                  # Vite configuration
│   └── package.json                    # Frontend dependencies
│
├── CHANGES.md                          # Detailed change log
└── README.md                           # This file
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
   The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

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

Colors are defined in `frontend/src/utils/colors.js` and `tailwind.config.js`:

| Token                      | Value                   | Usage                        |
| -------------------------- | ----------------------- | ---------------------------- |
| `primary`                  | `#155dfc`               | Personal mode buttons, links |
| `secondary`                | `#da7488`               | Caregiver mode buttons       |
| `text-primary`             | `#181818`               | Main text                    |
| `text-secondary`           | `#646464`               | Subdued text                 |
| `background-default`       | `#ffffff`               | Page background              |
| `background-subtle`        | `#f9f9f9`               | Card backgrounds             |
| `background-success-hover` | `#e9ffee`               | Medication hover state       |
| `border-default`           | `rgba(100,100,100,0.2)` | Card borders                 |

### Typography

- **Font Family**: Poppins
- **Weights**: 400 (Regular), 600 (SemiBold), 700 (Bold)
- **Sizes**: 12px, 14px, 16px, 20px, 32px

### Spacing

- Consistent spacing scale: 4px, 8px, 16px, 24px
- Border radius: 8px (cards), 16px (large cards), 44px (avatars)

## 🔌 API Endpoints

The backend provides RESTful API endpoints for:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Medications**: `/api/medications/*`
- **Appointments**: `/api/appointments/*`

## 🧪 Development

### Code Style

- ES6+ JavaScript
- React functional components with hooks
- JSDoc comments for component documentation
- Consistent naming conventions

### State Management

- React useState hooks for local state
- Props for component communication
- Callback functions for parent-child interaction
