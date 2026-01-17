/**
 * SettingsPage Component - User settings and preferences
 */
import React from "react";
import {
  GearIcon,
  UserIcon,
  ShieldCheckIcon,
  SignOutIcon,
  CaretRightIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { colors, getModeColors } from "../../utils/colors";

function SettingsPage({ user, mode = "Personal", onLogout }) {
  const modeColors = getModeColors(mode);

  // Settings section component
  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default bg-background-subtle">
        <Icon size={20} weight="fill" color={modeColors.DEFAULT} />
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
            style={!danger ? { backgroundColor: `${modeColors.DEFAULT}10` } : undefined}
          >
            <Icon
              size={20}
              weight="regular"
              className={danger ? "text-red-500" : ""}
              color={danger ? undefined : modeColors.DEFAULT}
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
      {action || (onClick && <CaretRightIcon size={20} color={colors.text.secondary} />)}
    </div>
  );

  return (
    <div className="bg-background-default w-full h-full p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <GearIcon size={32} weight="fill" color={modeColors.DEFAULT} />
          <div>
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
              Settings
            </h1>
            <p className="font-poppins text-text-secondary">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
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
                    backgroundColor: `${modeColors.DEFAULT}15`,
                    color: modeColors.DEFAULT,
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
              icon={WarningIcon}
              label="Delete Account"
              description="Permanently delete your account and all data"
              onClick={() => {}}
              danger
            />
          </SettingsSection>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
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
  );
}

export default SettingsPage;
