/**
 * SettingsPage Component - User settings and preferences
 */
import React, { useState } from "react";
import {
  GearIcon,
  UserIcon,
  ShieldCheckIcon,
  SignOutIcon,
  CaretRightIcon,
  GraduationCapIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { getModeHexColor, getModeClasses } from "../../utils/modeUtils";
import { GradientBackground } from "../ui";
import ConfirmDialog from "../ui/ConfirmDialog";

function SettingsPage({ user, mode = "Personal", onLogout, onShowOnboarding, onDeleteAccount }) {
  const modeHexColor = getModeHexColor(mode);
  const modeClasses = getModeClasses(mode);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Settings section component
  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default bg-background-subtle">
        <Icon size={20} weight="fill" color={modeHexColor} />
        <h2 className="font-poppins font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="divide-y divide-border-default">{children}</div>
    </div>
  );

  // Settings row component
  const SettingsRow = ({ icon: Icon, label, description, action, onClick, danger }) => (
    <div
      className={`flex items-center justify-between px-5 py-4 ${
        onClick ? "cursor-pointer hover:bg-background-hover transition-colors" : ""
      } ${danger ? "group" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              danger ? "bg-red-50 group-hover:bg-red-100" : ""
            }`}
            style={!danger ? { backgroundColor: `${modeHexColor}10` } : undefined}
          >
            <Icon
              size={20}
              weight="regular"
              className={danger ? "text-red-500" : ""}
              color={danger ? undefined : modeHexColor}
            />
          </div>
        )}
        <div>
          <p
            className={`font-poppins font-medium ${
              danger ? "text-red-500 group-hover:text-red-600" : "text-text-primary"
            }`}
          >
            {label}
          </p>
          {description && (
            <p className="font-poppins text-sm text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      {action || (onClick && <CaretRightIcon size={20} className="text-text-secondary" />)}
    </div>
  );

  return (
    <div className="bg-background-default w-full relative">
      {/* Gradient background decoration */}
      <GradientBackground />

      {/* Main content area */}
      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-6">
        <div className="w-full max-w-[67.5rem] mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <GearIcon size={32} weight="fill" color={modeHexColor} />
            <div>
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
                Settings
              </h1>
              <p className="font-poppins text-sm text-text-secondary mt-2">
                Manage your account and preferences
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
          {/* Account Section */}
          <SettingsSection title="Account" icon={UserIcon}>
            <SettingsRow
              icon={UserIcon}
              label={user?.name || "User"}
              description={user?.email || "user@email.com"}
              action={
                <span
                  className="px-3 py-1 rounded-full text-xs font-poppins font-semibold"
                  style={{
                    backgroundColor: `${modeHexColor}15`,
                    color: modeHexColor,
                  }}
                >
                  {mode}
                </span>
              }
            />
            <SettingsRow
              icon={ShieldCheckIcon}
              label="Change Password"
              description="Update your password"
              onClick={() => {}}
            />
            <SettingsRow
              icon={TrashIcon}
              label="Delete Account"
              description="Permanently delete your account and all data"
              onClick={() => setShowDeleteConfirm(true)}
              danger={true}
            />
          </SettingsSection>

          {/* Help & Support Section */}
          <SettingsSection title="Help & Support" icon={GraduationCapIcon}>
            <SettingsRow
              icon={GraduationCapIcon}
              label="View Tutorial"
              description="Learn how to use MedTracker"
              onClick={onShowOnboarding}
            />
          </SettingsSection>

          {/* Sign Out Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all group"
          >
            <SignOutIcon
              size={20}
              weight="regular"
              className="text-red-500 group-hover:text-red-600"
            />
            <span className="font-poppins font-semibold text-red-500 group-hover:text-red-600">
              Sign Out
            </span>
          </button>

          {/* App version */}
          <p className="text-center font-poppins text-sm text-text-secondary pt-4">
            MedTracker v1.0.0
          </p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="warning"
        icon={<SignOutIcon size={32} weight="fill" />}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (onDeleteAccount) {
            onDeleteAccount();
          }
          setShowDeleteConfirm(false);
        }}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your medications, appointments, and data will be permanently deleted."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        icon={<TrashIcon size={32} weight="fill" />}
      />
    </div>
  );
}

export default SettingsPage;
