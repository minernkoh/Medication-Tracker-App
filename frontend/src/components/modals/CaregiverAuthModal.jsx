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
  XIcon,
  UsersIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  HeartIcon,
  ShieldCheckIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import { colors } from "../../utils/colors";

function CaregiverAuthModal({ isOpen, onClose, onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setIsLogin(true);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isLogin) {
        onLogin?.({
          email: formData.email,
          mode: "Caregiver",
        });
      } else {
        onSignup?.({
          name: formData.name,
          email: formData.email,
          mode: "Caregiver",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - centered in viewport */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-br from-secondary via-pink-400 to-rose-400 p-8 pb-16 relative">
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <XIcon size={20} weight="bold" color="#ffffff" />
          </button>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>

          {/* Icon and title */}
          <div className="relative text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UsersIcon size={32} weight="fill" color="#ffffff" />
            </div>
            <h2 className="font-poppins font-bold text-2xl text-white mb-1">
              {isLogin ? "Caregiver Login" : "Create Caregiver Account"}
            </h2>
            <p className="font-poppins text-white/80 text-sm">
              {isLogin
                ? "Sign in to manage care for your loved ones"
                : "Start managing care for your loved ones"}
            </p>
          </div>
        </div>

        {/* Features (shown only for signup) */}
        {!isLogin && (
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name field (signup only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="font-poppins font-semibold text-sm text-text-primary">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-border-default focus:ring-secondary/20 focus:border-secondary"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm font-poppins">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label className="font-poppins font-semibold text-sm text-text-primary">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon
                size={20}
                weight="regular"
                color={colors.icon.secondary}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-300 focus:ring-red-200"
                    : "border-border-default focus:ring-secondary/20 focus:border-secondary"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm font-poppins">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="font-poppins font-semibold text-sm text-text-primary">
              Password
            </label>
            <div className="relative">
              <LockIcon
                size={20}
                weight="regular"
                color={colors.icon.secondary}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-border-default focus:ring-secondary/20 focus:border-secondary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon size={20} weight="regular" />
                ) : (
                  <EyeIcon size={20} weight="regular" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm font-poppins">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (signup only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="font-poppins font-semibold text-sm text-text-primary">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-200"
                    : "border-border-default focus:ring-secondary/20 focus:border-secondary"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-poppins">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full text-white font-poppins font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-6"
            style={{
              backgroundColor: colors.secondary.DEFAULT,
              boxShadow: "0 10px 25px -5px rgba(218, 116, 136, 0.35)",
            }}
          >
            {isLogin ? "Sign In as Caregiver" : "Create Caregiver Account"}
            <ArrowRightIcon size={18} weight="bold" />
          </button>
        </form>

        {/* Switch between login/signup */}
        <div className="px-6 pb-6">
          <p className="text-center font-poppins text-text-secondary text-sm">
            {isLogin
              ? "Don't have a caregiver account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="font-semibold hover:underline"
              style={{ color: colors.secondary.DEFAULT }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CaregiverAuthModal;
