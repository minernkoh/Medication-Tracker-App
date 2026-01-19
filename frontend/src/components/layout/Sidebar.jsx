/**
 * Sidebar Component - Left navigation panel with user profile and menu
 *
 * @param {string} userName - User's full name
 * @param {string} userEmail - User's email address
 * @param {string} mode - "Personal" or "Caregiver"
 * @param {string} selectedMenu - Currently selected menu item
 * @param {function} onMenuClick - Called when menu item is clicked (deprecated, using React Router now)
 * @param {function} onSwitchMode - Called when switching modes
 * @param {boolean} isOpen - Whether sidebar is open on mobile
 * @param {function} onClose - Function to close sidebar on mobile
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FirstAidKitIcon,
  UsersIcon,
  XIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { SideMenuButtons } from "../ui";
import { colors } from "../../../tailwind.config.js";
import { isReadOnlyPatientUser } from "../../utils/modeUtils";

function Sidebar({
  userName,
  userEmail,
  mode = "Personal",
  selectedMenu,
  onMenuClick,
  onSwitchMode,
  isOpen = false,
  onClose,
}) {
  // Get user data from localStorage if not provided
  const [userData] = React.useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const displayName = userName || userData?.name || "User";
  const displayEmail = userEmail || userData?.email || "";
  const displayMode =
    mode || (userData?.role === "caregiver" ? "Caregiver" : "Personal");
  const isReadOnly = isReadOnlyPatientUser(userData);

  // Get first letter of name for avatar
  const userInitial = displayName.charAt(0).toUpperCase();

  // Get current route to determine selected menu
  const location = useLocation();
  const currentMenu =
    selectedMenu ||
    (location.pathname.includes("/appointments")
      ? "Appointments"
      : location.pathname.includes("/patients")
        ? "Patients"
        : location.pathname.includes("/medication")
          ? "Medications"
          : location.pathname.includes("/settings")
            ? "Settings"
            : "Dashboard");

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-background-default border-r border-border-default flex flex-col items-center justify-between w-[16rem] z-40 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } transition-transform duration-300 ease-in-out`}
    >
      {/* Close button (mobile only) */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 hover:bg-background-hover rounded-lg transition-colors"
        aria-label="Close menu"
      >
        <XIcon size={24} weight="regular" color={colors.icon.primary} />
      </button>

      {/* Top section: Logo and menu */}
      <div className="flex flex-col items-start shrink-0 w-full pt-16 md:pt-0">
        {/* Logo section */}
        <div className="flex gap-[0.8125rem] items-center opacity-80 pb-6 pt-8 px-5 shrink-0 w-full">
          <div className="flex-shrink-0 w-8 h-8">
            <FirstAidKitIcon
              size={32}
              weight="regular"
              color={colors.icon.primary}
            />
          </div>
          <div className="flex flex-col items-start justify-center not-italic shrink-0">
            <p className="font-poppins font-bold leading-none text-xl text-text-primary">
              MedTracker
            </p>
            <p className="font-poppins font-normal leading-6 text-sm text-text-secondary">
              {displayMode}
            </p>
          </div>
        </div>

        {/* User profile section */}
        <div className="border-t border-b border-border-default flex gap-4 items-center px-5 py-4 shrink-0 w-full">
          <div className="bg-primary flex flex-col items-center justify-center p-2 rounded-full shrink-0 w-8 h-8">
            <p className="font-poppins font-semibold leading-6 text-base text-text-onPrimary text-center">
              {userInitial}
            </p>
          </div>
          <div className="flex flex-col items-start leading-6 not-italic shrink-0 text-text-primary flex-1">
            <div className="flex items-center gap-2">
              <p className="font-poppins font-semibold text-sm">
                {displayName}
              </p>
              {isReadOnly && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full">
                  <EyeIcon
                    size={12}
                    weight="bold"
                    color={colors.icon.primary}
                  />
                  <p className="font-poppins font-semibold text-xs text-blue-700">
                    View Only
                  </p>
                </div>
              )}
            </div>
            <p className="font-poppins font-normal text-xs w-full text-text-secondary">
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Navigation menu buttons */}
        <div className="flex flex-col gap-4 items-start px-2 py-5 shrink-0 w-full">
          <Link
            to="/dashboard"
            onClick={(e) => {
              onMenuClick?.("Dashboard");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Dashboard"
              isSelected={currentMenu === "Dashboard"}
              mode={displayMode}
              onClick={(e) => {
                // Let Link handle navigation, just close sidebar if needed
                onClose?.();
              }}
            />
          </Link>

          {/* Patients menu - only in Caregiver mode */}
          {mode === "Caregiver" && (
            <Link
              to="/patients"
              onClick={(e) => {
                onMenuClick?.("Patients");
                onClose?.();
              }}
              className="w-full no-underline"
            >
              <SideMenuButtons
                type="Patients"
                isSelected={currentMenu === "Patients"}
                mode={displayMode}
                onClick={(e) => {
                  onClose?.();
                }}
              />
            </Link>
          )}

          {/* Medications menu - only in Personal mode */}
          {mode === "Personal" && (
            <Link
              to="/medications"
              onClick={(e) => {
                onMenuClick?.("Medications");
                onClose?.();
              }}
              className="w-full no-underline"
            >
              <SideMenuButtons
                type="Medications"
                isSelected={currentMenu === "Medications"}
                mode={displayMode}
                onClick={(e) => {
                  onClose?.();
                }}
              />
            </Link>
          )}

          <Link
            to="/appointments"
            onClick={(e) => {
              onMenuClick?.("Appointments");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Appointments"
              isSelected={currentMenu === "Appointments"}
              mode={displayMode}
              onClick={(e) => {
                onClose?.();
              }}
            />
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            onClick={(e) => {
              onMenuClick?.("Settings");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Settings"
              isSelected={currentMenu === "Settings"}
              mode={displayMode}
              onClick={(e) => {
                onClose?.();
              }}
            />
          </Link>
        </div>
      </div>

      {/* Bottom section: Switch mode and Logout */}
      <div className="w-full">
        {/* Switch mode button */}
        <div
          className="border-t border-border-default flex gap-4 items-center px-5 py-4 shrink-0 w-full cursor-pointer hover:bg-background-hover transition-colors group"
          onClick={() => {
            onSwitchMode?.();
            onClose?.();
          }}
        >
          <div className="flex-shrink-0 w-6 h-6">
            <UsersIcon
              size={24}
              weight="regular"
              color={
                displayMode === "Personal"
                  ? colors.icon.primary
                  : colors.secondary.DEFAULT
              }
            />
          </div>
          <div className="flex flex-col items-start shrink-0 w-[9.9375rem]">
            <p className="font-poppins font-normal leading-6 text-xs text-text-primary">
              Switch to
            </p>
            <div className="flex items-center shrink-0">
              <p
                className="font-poppins font-semibold leading-6 text-sm transition-colors"
                style={{
                  color:
                    displayMode === "Personal"
                      ? colors.text.primary
                      : colors.secondary.DEFAULT,
                }}
              >
                {displayMode === "Personal"
                  ? "Caregiver Mode"
                  : "Personal Mode"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
