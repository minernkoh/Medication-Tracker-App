import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HouseIcon,
  PillIcon,
  CalendarCheckIcon,
  UsersIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { api } from "../api";

const Sidebar = () => {
  const navigate = useNavigate();
  // Get user data from localStorage
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const isCaregiver = userData?.role === "caregiver";

  const handleLogout = () => {
    api.auth.logout();
    navigate("/");
    window.location.reload(); // Force reload to clear state
  };

  // Base navigation items for all users
  const baseNavItems = [
    { path: "/", icon: HouseIcon, label: "Dashboard" },
    { path: "/appointments", icon: CalendarCheckIcon, label: "Appointments" },
  ];

  // Patient-specific items
  const patientNavItems = [
    { path: "/medications", icon: PillIcon, label: "Medications" },
  ];

  // Caregiver-specific items
  const caregiverNavItems = [
    { path: "/caregiver/patients", icon: UsersIcon, label: "My Patients" },
    {
      path: "/caregiver/schedule",
      icon: CalendarCheckIcon,
      label: "Caregiver Schedule",
    },
  ];

  // Combine navigation items based on user role
  const navItems = [
    ...baseNavItems,
    ...(isCaregiver ? caregiverNavItems : patientNavItems),
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">MedTracker</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <item.icon size={20} weight="regular" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button at bottom */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <SignOutIcon size={20} weight="regular" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
