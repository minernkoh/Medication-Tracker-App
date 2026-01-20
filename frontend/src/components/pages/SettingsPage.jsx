/**
 * SettingsPage Component - User settings and preferences
 */
import { useState } from "react";
import {
  UserIcon,
  ShieldCheckIcon,
  SignOutIcon,
  CaretRightIcon,
  GraduationCapIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../utils/modeUtils";
import { GradientBackground, Modal, FormField, Button } from "../ui";
import ConfirmDialog from "../ui/ConfirmDialog";
import { api } from "../../api";
import { useError } from "../../contexts/ErrorContext";

function SettingsPage({
  user,
  mode = "Personal",
  onLogout,
  onShowOnboarding,
  onDeleteAccount,
}) {
  const modeHexColor = getModeHexColor(mode);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const { showError } = useError();

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitChangePassword = async (e) => {
    e?.preventDefault();
    if (!validatePasswordForm()) return;
    setIsChangingPassword(true);
    try {
      await api.users.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setShowChangePassword(false);
      resetPasswordForm();
    } catch (error) {
      showError(error.message || "Unable to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Settings section component
  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default bg-background-subtle">
        <Icon size={20} weight="fill" color={modeHexColor} />
        <h2 className="font-poppins font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-border-default">{children}</div>
    </div>
  );

  // Settings row component
  const SettingsRow = ({
    icon: Icon,
    label,
    description,
    action,
    onClick,
    danger,
  }) => (
    <div
      className={`flex items-center justify-between px-5 py-4 ${
        onClick
          ? "cursor-pointer hover:bg-background-hover transition-colors"
          : ""
      } ${danger ? "group" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              danger ? "bg-red-50 group-hover:bg-red-100" : ""
            }`}
            style={
              !danger ? { backgroundColor: `${modeHexColor}10` } : undefined
            }
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
              danger
                ? "text-red-500 group-hover:text-red-600"
                : "text-text-primary"
            }`}
          >
            {label}
          </p>
          {description && (
            <p className="font-poppins text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {action ||
        (onClick && (
          <CaretRightIcon size={20} className="text-text-secondary" />
        ))}
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
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
              Settings
            </h1>
            <p className="font-poppins text-base text-text-secondary mt-2">
              Manage your account and preferences
            </p>
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
                onClick={() => setShowChangePassword(true)}
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
        onConfirm={() => {
          if (onLogout) {
            onLogout();
          }
        }}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon={SignOutIcon}
        mode={mode}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          if (onDeleteAccount) {
            try {
              await onDeleteAccount();
              setShowDeleteConfirm(false);
            } catch (error) {
              // Error is handled by ErrorContext
              // Keep dialog open so user can try again
            }
          }
        }}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your medications, appointments, and data will be permanently deleted."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        icon={<TrashIcon size={32} weight="fill" />}
        mode={mode}
      />

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          resetPasswordForm();
        }}
        title="Change Password"
        size="md"
        mode={mode}
        footerContent={
          <>
            <Button
              variant="modalSecondary"
              onClick={() => {
                setShowChangePassword(false);
                resetPasswordForm();
              }}
              fullWidth
              mode={mode}
            >
              Cancel
            </Button>
            <Button
              variant={mode === "Caregiver" ? "secondary" : "primary"}
              onClick={submitChangePassword}
              fullWidth
              disabled={isChangingPassword}
              mode={mode}
            >
              {isChangingPassword ? "Updating…" : "Update Password"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitChangePassword} className="p-5 space-y-4">
          <FormField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
            required
          />
          <FormField
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.newPassword}
            required
          />
          <FormField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.confirmPassword}
            required
          />
        </form>
      </Modal>
    </div>
  );
}

export default SettingsPage;
