/**
 * CaregiverAuthModal Component - Modal for caregiver login/signup when switching modes
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onLogin - Callback when user successfully logs in as caregiver
 * @param {function} onSignup - Callback when user signs up as caregiver
 */
import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  HeartIcon,
  ShieldCheckIcon,
  ArrowsClockwiseIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Modal, FormField, Button } from "../ui";
import { colors } from "../../../tailwind.config.js";
import { useError } from "../../contexts/ErrorContext";

function CaregiverAuthModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  role = "caregiver",
  allowSignup = true,
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const { showError } = useError();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setIsLogin(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!allowSignup) {
      setIsLogin(true);
    }
  }, [allowSignup]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (isLogin) {
          await onLogin?.({
            email: formData.email,
            password: formData.password,
            role,
          });
        } else {
          await onSignup?.({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role,
          });
        }
      } catch (error) {
        showError(error?.message || "Authentication failed");
      }
    }
  };

  if (!isOpen) return null;

  // Helper function for box shadow (if needed)
  const getBoxShadow = (color, opacity, size) => {
    const shadows = {
      sm: `0 1px 2px 0 ${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
      md: `0 4px 6px -1px ${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}, 0 2px 4px -1px ${color}${Math.round(opacity * 200)
        .toString(16)
        .padStart(2, "0")}`,
      lg: `0 10px 15px -3px ${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}, 0 4px 6px -2px ${color}${Math.round(opacity * 200)
        .toString(16)
        .padStart(2, "0")}`,
    };
    return shadows[size] || shadows.md;
  };

  const roleLabel = role === "patient" ? "Patient" : "Caregiver";
  const headerIcon = role === "patient" ? HeartIcon : UsersIcon;
  const headerSubtitle = isLogin
    ? role === "patient"
      ? "Sign in to manage your own health"
      : "Sign in to manage care for your loved ones"
    : role === "patient"
      ? "Create a personal account to track your health"
      : "Start managing care for your loved ones";

  const customHeader = (
    <div className="bg-gradient-to-br from-secondary via-pink-400 to-rose-400 p-8 pb-16 relative rounded-t-2xl overflow-hidden w-full">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 z-20"
        aria-label="Close modal"
      >
        <XIcon size={20} weight="regular" color="white" />
      </button>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
      </div>

      {/* Icon and title */}
      <div className="relative text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          {React.createElement(headerIcon, {
            size: 32,
            weight: "fill",
            color: colors.text.onPrimary,
          })}
        </div>
        <h2 className="font-poppins font-bold text-2xl text-white mb-1">
          {isLogin ? `${roleLabel} Login` : `Create ${roleLabel} Account`}
        </h2>
        <p className="font-poppins text-white/80 text-sm">{headerSubtitle}</p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={customHeader}
      size="md"
      className="overflow-hidden"
      showCloseButton={false}
    >
      {/* Features (shown only for signup) */}
      {!isLogin && allowSignup && (
        <div className="px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-4">
            <div className="flex-1 text-center p-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <HeartIcon
                  size={20}
                  weight="fill"
                  color={colors.secondary.DEFAULT}
                />
              </div>
              <p className="font-poppins text-xs text-text-primary font-semibold">
                Care
              </p>
            </div>
            <div className="flex-1 text-center p-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ShieldCheckIcon
                  size={20}
                  weight="fill"
                  color={colors.secondary.DEFAULT}
                />
              </div>
              <p className="font-poppins text-xs text-text-primary font-semibold">
                Protect
              </p>
            </div>
            <div className="flex-1 text-center p-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowsClockwiseIcon
                  size={20}
                  weight="fill"
                  color={colors.secondary.DEFAULT}
                />
              </div>
              <p className="font-poppins text-xs text-text-primary font-semibold">
                Manage
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form - Scrollable Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name field (signup only) */}
        {!isLogin && allowSignup && (
          <FormField
            label="Full Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            error={errors.name}
            required
          />
        )}

        {/* Email field */}
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          error={errors.email}
          icon={
            <EnvelopeIcon
              size={18}
              weight="regular"
              color={colors.icon.secondary}
            />
          }
          required
        />

        {/* Password field */}
        <div className="relative">
          <FormField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            error={errors.password}
            icon={
              <LockIcon
                size={18}
                weight="regular"
                color={colors.icon.secondary}
              />
            }
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[2.75rem] text-text-secondary hover:text-text-primary transition-colors z-10"
          >
            {showPassword ? (
              <EyeSlashIcon size={20} weight="regular" />
            ) : (
              <EyeIcon size={20} weight="regular" />
            )}
          </button>
        </div>

        {/* Confirm Password (signup only) */}
        {!isLogin && allowSignup && (
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            required
          />
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          iconRight={<ArrowRightIcon size={18} weight="bold" />}
          className="mt-6"
        >
          {isLogin ? `Sign In as ${roleLabel}` : `Create ${roleLabel} Account`}
        </Button>
      </form>

      {/* Switch between login/signup */}
      {allowSignup && (
        <div className="px-6 pb-6">
          <p className="text-center font-poppins text-text-secondary text-sm">
            {isLogin
              ? `Don't have a ${roleLabel.toLowerCase()} account? `
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
}

export default CaregiverAuthModal;
