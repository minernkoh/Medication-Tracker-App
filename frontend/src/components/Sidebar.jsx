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
import { FirstAidKitIcon, UsersIcon, XIcon } from "@phosphor-icons/react";
import MenuButtons from "./buttons/SideMenu";
import { colors } from "../utils/colors";

function Sidebar({
  userName = "Sarah Johnson",
  userEmail = "sarahjohnson@gmail.com",
  mode = "Personal",
  selectedMenu,
  onMenuClick,
  onSwitchMode,
  isOpen = false,
  onClose,
}) {
  // Get first letter of name for avatar
  const userInitial = userName.charAt(0).toUpperCase();

  // Get current route to determine selected menu
  const location = useLocation();
  const currentMenu =
    selectedMenu ||
    (location.pathname.includes("/appointments")
      ? "Appointments"
      : location.pathname.includes("/medication")
      ? "Medications"
      : "Dashboard");

  return (
    <div
      className={`fixed md:static bg-background-default border-r border-border-default flex flex-col h-screen md:h-screen items-center justify-between left-0 top-0 w-[16rem] z-40 transform ${
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
              {mode}
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
          <div className="flex flex-col items-start leading-6 not-italic shrink-0 text-text-primary w-[9.9375rem]">
            <p className="font-poppins font-semibold text-sm w-full">
              {userName}
            </p>
            <p className="font-poppins font-normal text-xs w-full">
              {userEmail}
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
            <MenuButtons
              type="Dashboard"
              isSelected={currentMenu === "Dashboard"}
              mode={mode}
              onClick={(e) => {
                // Let Link handle navigation, just close sidebar if needed
                onClose?.();
              }}
            />
          </Link>
          <Link
            to="/medications"
            onClick={(e) => {
              onMenuClick?.("Medications");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <MenuButtons
              type="Medications"
              isSelected={currentMenu === "Medications"}
              mode={mode}
              onClick={(e) => {
                onClose?.();
              }}
            />
          </Link>
          <Link
            to="/appointments"
            onClick={(e) => {
              onMenuClick?.("Appointments");
              onClose?.();
            }}
            className="w-full no-underline"
          >
            <MenuButtons
              type="Appointments"
              isSelected={currentMenu === "Appointments"}
              mode={mode}
              onClick={(e) => {
                onClose?.();
              }}
            />
          </Link>
        </div>
      </div>

      {/* Switch mode button */}
      <div
        className="border-t border-border-default flex gap-4 items-center px-5 py-6 shrink-0 w-full cursor-pointer hover:bg-background-hover transition-colors"
        onClick={() => {
          onSwitchMode?.();
          onClose?.();
        }}
      >
        <div className="flex-shrink-0 w-6 h-6">
          <UsersIcon size={24} weight="regular" color={colors.icon.primary} />
        </div>
        <div className="flex flex-col items-start shrink-0 w-[9.9375rem]">
          <p className="font-poppins font-normal leading-6 text-xs text-text-primary">
            Switch to{" "}
          </p>
          <div className="flex items-center shrink-0">
            <p className="font-poppins font-semibold leading-6 text-sm text-text-primary">
              Caregiver Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
