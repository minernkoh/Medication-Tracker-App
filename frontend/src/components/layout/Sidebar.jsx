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
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { SideMenuButtons } from "../ui";
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
  isCollapsed = false,
  onToggleCollapsed,
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
  const isCaregiverMode = displayMode === "Caregiver";
  const isReadOnly = isReadOnlyPatientUser(userData);
  const caregiverName = (() => {
    if (!isReadOnly) return null;
    const caregivers = userData?.caregivers;
    if (!Array.isArray(caregivers) || caregivers.length === 0) return null;
    const first = caregivers[0];
    if (first && typeof first === "object") return first.name || null;
    return null;
  })();

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
      className={`fixed left-0 top-0 h-screen bg-background-default border-r border-border-default flex flex-col items-center justify-between ${
        isCollapsed ? "w-[4.5rem]" : "w-[15rem]"
      } z-40 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } transition-transform duration-300 ease-in-out`}
    >
      {/* Close button (mobile only) */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 hover:bg-background-hover rounded-lg transition-colors"
        aria-label="Close menu"
      >
        <XIcon size={24} weight="regular" className="text-icon-primary" />
      </button>

      {/* Top section: Logo and menu */}
      <div className="flex flex-col items-start shrink-0 w-full pt-16 md:pt-0">
        {/* Logo section */}
        <div
          className={`flex items-center opacity-80 pb-5 pt-6 shrink-0 w-full ${
            isCollapsed ? "px-2.5" : "px-4"
          } justify-between`}
        >
          <div className="flex items-center gap-[0.8125rem] flex-1 min-w-0">
            <div className="flex-shrink-0 w-7 h-7">
              <FirstAidKitIcon
                size={28}
                weight="regular"
                className="text-icon-primary"
              />
            </div>
            <div
              className={`flex flex-col items-start justify-center not-italic shrink-0 ${
                isCollapsed ? "hidden" : ""
              } min-w-0`}
            >
              <p className="font-poppins font-bold leading-none text-lg text-text-primary truncate max-w-full">
                MedTracker
              </p>
              <span
                className={`mt-1 px-3 py-1 rounded-full text-xs font-poppins font-semibold max-w-full truncate shadow-sm ring-1 ring-black/10 ${
                  isCaregiverMode
                    ? "bg-secondary text-text-onSecondary"
                    : "bg-primary text-text-onPrimary"
                }`}
              >
                {displayMode}
              </span>
            </div>
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            type="button"
            onClick={() => onToggleCollapsed?.(!isCollapsed)}
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-lg hover:bg-background-hover transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <CaretRightIcon size={18} weight="bold" />
            ) : (
              <CaretLeftIcon size={18} weight="bold" />
            )}
          </button>
        </div>

        {/* User profile section */}
        <div
          className={`border-t border-b border-border-default flex gap-4 items-center py-4 shrink-0 w-full ${
            isCollapsed ? "px-2.5 justify-center" : "px-4"
          }`}
        >
          <div className="bg-primary flex flex-col items-center justify-center p-2 rounded-full shrink-0 w-8 h-8">
            <p className="font-poppins font-semibold leading-6 text-base text-text-onPrimary text-center">
              {userInitial}
            </p>
          </div>
          <div
            className={`flex flex-col items-start leading-6 not-italic shrink-0 text-text-primary flex-1 ${
              isCollapsed ? "hidden" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="font-poppins font-semibold text-sm">
                {displayName}
              </p>
            </div>
            <p className="font-poppins font-normal text-xs w-full text-text-secondary">
              {displayEmail}
            </p>
            {!isCaregiverMode && isReadOnly && (
              <div className="mt-2 flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full">
                <EyeIcon size={12} weight="bold" className="text-blue-700" />
                <p className="font-poppins font-semibold text-xs text-blue-700">
                  View Only
                </p>
              </div>
            )}
            {!isCaregiverMode && isReadOnly && caregiverName && (
              <div className="mt-1 w-full">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full border border-secondary/20 shadow-sm font-poppins font-semibold text-[11px] w-full truncate bg-secondary-light text-secondary"
                  title={`Caregiver: ${caregiverName}`}
                >
                  Caregiver: {caregiverName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation menu buttons */}
        <div
          className={`flex flex-col gap-3 py-4 shrink-0 w-full ${
            isCollapsed ? "items-center px-2" : "items-start px-2"
          }`}
        >
          <Link
            to="/dashboard"
            onClick={() => {
              onMenuClick?.("Dashboard");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Dashboard"
              isSelected={currentMenu === "Dashboard"}
              mode={displayMode}
              collapsed={isCollapsed}
              onClick={() => {
                // Let Link handle navigation, just close sidebar if needed
                onClose?.();
              }}
            />
          </Link>

          {/* Patients menu - only in Caregiver mode */}
          {mode === "Caregiver" && (
            <Link
              to="/patients"
              onClick={() => {
                onMenuClick?.("Patients");
                onClose?.();
              }}
              className="w-full no-underline"
            >
              <SideMenuButtons
                type="Patients"
                isSelected={currentMenu === "Patients"}
                mode={displayMode}
                collapsed={isCollapsed}
                onClick={() => {
                  onClose?.();
                }}
              />
            </Link>
          )}

          {/* Medications menu - only in Personal mode */}
          {mode === "Personal" && (
            <Link
              to="/medications"
              onClick={() => {
                onMenuClick?.("Medications");
                onClose?.();
              }}
              className="w-full no-underline"
            >
              <SideMenuButtons
                type="Medications"
                isSelected={currentMenu === "Medications"}
                mode={displayMode}
                collapsed={isCollapsed}
                onClick={() => {
                  onClose?.();
                }}
              />
            </Link>
          )}

          <Link
            to="/appointments"
            onClick={() => {
              onMenuClick?.("Appointments");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Appointments"
              isSelected={currentMenu === "Appointments"}
              mode={displayMode}
              collapsed={isCollapsed}
              onClick={() => {
                onClose?.();
              }}
            />
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            onClick={() => {
              onMenuClick?.("Settings");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <SideMenuButtons
              type="Settings"
              isSelected={currentMenu === "Settings"}
              mode={displayMode}
              collapsed={isCollapsed}
              onClick={() => {
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
          className={`border-t border-border-default flex gap-4 items-center py-3 shrink-0 w-full cursor-pointer hover:bg-background-hover transition-colors group ${
            isCollapsed ? "justify-center px-2.5" : "px-4"
          }`}
          onClick={() => {
            onSwitchMode?.();
            onClose?.();
          }}
          title={isCollapsed ? "Switch mode" : undefined}
        >
          <div className="flex-shrink-0 w-6 h-6">
            <UsersIcon
              size={22}
              weight="regular"
              className={
                displayMode === "Personal" ? "text-icon-primary" : "text-secondary"
              }
            />
          </div>
          <div
            className={`flex flex-col items-start shrink-0 w-[9.9375rem] ${
              isCollapsed ? "hidden" : ""
            }`}
          >
            <p className="font-poppins font-normal leading-6 text-xs text-text-primary">
              Switch to
            </p>
            <div className="flex items-center shrink-0">
              <p
                className={`font-poppins font-semibold leading-6 text-sm transition-colors ${
                  displayMode === "Personal" ? "text-text-primary" : "text-secondary"
                }`}
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
