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
  XIcon,
} from "@phosphor-icons/react";
import { Modal, FormField, Button } from "../ui";
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

  const isPatient = role === "patient";
  const ctaVariant = isPatient ? "primary" : "secondary";

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
    <div
      className={`bg-gradient-to-br p-8 pb-16 relative rounded-t-2xl overflow-hidden w-full ${
        role === "patient"
          ? "from-primary via-blue-400 to-indigo-400"
          : "from-secondary via-pink-400 to-rose-400"
      }`}
    >
      {/* Close button */}
      <button
        type="button"
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
            className: "text-white",
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
              className="text-icon-secondary"
            />
          }
          required
        />

        {/* Password field */}
        <FormField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          error={errors.password}
          icon={<LockIcon size={18} weight="regular" className="text-icon-secondary" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon size={20} weight="regular" />
              ) : (
                <EyeIcon size={20} weight="regular" />
              )}
            </button>
          }
          required
        />

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
          variant={ctaVariant}
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
