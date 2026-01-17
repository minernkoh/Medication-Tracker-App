/**
 * AuthPage Component - Login/Signup page with account type selection
 *
 * @param {function} onLogin - Callback when user successfully logs in
 * @param {boolean} isNewUser - Whether to show onboarding after login
 */
import React, { useState } from "react";
import {
  FirstAidKitIcon,
  UserIcon,
  UsersIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  BellIcon,
  CalendarCheckIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";

function AuthPage({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState(null); // "patient" or "caregiver"
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
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

    if (!isLogin && !accountType) {
      newErrors.accountType = "Please select an account type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // For demo purposes, just trigger login
      const isFirstTime = !isLogin;
      if (isFirstTime) {
        onSignup?.({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: accountType,
        });
      } else {
        onLogin?.({
          email: formData.email,
          password: formData.password,
        });
      }
    }
  };

  // Account type selection for signup
  const AccountTypeCard = ({
    type,
    icon: Icon,
    title,
    description,
    selected,
  }) => (
    <button
      type="button"
      onClick={() => setAccountType(type)}
      className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
        selected
          ? type === "patient"
            ? "border-primary bg-primary/5 shadow-md"
            : "border-secondary bg-secondary/5 shadow-md"
          : "border-border-default hover:border-gray-300"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          selected
            ? type === "patient"
              ? "bg-primary"
              : "bg-secondary"
            : "bg-gray-100 group-hover:bg-gray-200"
        }`}
      >
        <Icon
          size={24}
          weight={selected ? "fill" : "regular"}
          color={selected ? colors.text.onPrimary : colors.icon.primary}
        />
      </div>
      <h3 className="font-poppins font-bold text-lg text-text-primary mb-1">
        {title}
      </h3>
      <p className="font-poppins text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
      {selected && (
        <div
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${
            type === "patient" ? "text-primary" : "text-secondary"
          }`}
        >
          <CheckIcon size={16} weight="bold" />
          Selected
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-5" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <FirstAidKitIcon
              size={28}
              weight="fill"
              color={colors.text.onPrimary}
            />
          </div>
          <div>
            <h1 className="font-poppins font-bold text-2xl text-white">
              MedTracker
            </h1>
            <p className="font-poppins text-white/70 text-sm">
              Your health companion
            </p>
          </div>
        </div>

        {/* Features showcase */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-poppins font-bold text-4xl text-white leading-tight mb-4">
              Track your health journey with confidence
            </h2>
            <p className="font-poppins text-white/80 text-lg leading-relaxed max-w-md">
              Never miss a medication or appointment again. MedTracker helps you
              stay on top of your health.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BellIcon
                  size={20}
                  weight="fill"
                  color={colors.text.onPrimary}
                />
              </div>
              <div>
                <p className="font-poppins font-semibold text-white">
                  Smart Reminders
                </p>
                <p className="font-poppins text-white/70 text-sm">
                  Never miss a dose
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CalendarCheckIcon
                  size={20}
                  weight="fill"
                  color={colors.text.onPrimary}
                />
              </div>
              <div>
                <p className="font-poppins font-semibold text-white">
                  Appointment Tracking
                </p>
                <p className="font-poppins text-white/70 text-sm">
                  Keep all your appointments organized
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <HeartIcon
                  size={20}
                  weight="fill"
                  color={colors.text.onPrimary}
                />
              </div>
              <div>
                <p className="font-poppins font-semibold text-white">
                  Health Insights
                </p>
                <p className="font-poppins text-white/70 text-sm">
                  Track your progress over time
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 font-poppins text-white/50 text-sm">
          © {new Date().getFullYear()} MedTracker. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FirstAidKitIcon
                size={24}
                weight="fill"
                color={colors.text.onPrimary}
              />
            </div>
            <h1 className="font-poppins font-bold text-xl text-text-primary">
              MedTracker
            </h1>
          </div>

          {/* Form header */}
          <div className="text-center mb-8">
            <h2 className="font-poppins font-bold text-3xl text-text-primary mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="font-poppins text-text-secondary">
              {isLogin
                ? "Sign in to continue managing your health"
                : "Start your health journey today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account type selection (signup only) */}
            {!isLogin && (
              <div className="space-y-3">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  I am a...
                </label>
                <div className="flex gap-4">
                  <AccountTypeCard
                    type="patient"
                    icon={UserIcon}
                    title="Patient"
                    description="Track my own medications and appointments"
                    selected={accountType === "patient"}
                  />
                  <AccountTypeCard
                    type="caregiver"
                    icon={UsersIcon}
                    title="Caregiver"
                    description="Help manage care for someone else"
                    selected={accountType === "caregiver"}
                  />
                </div>
                {errors.accountType && (
                  <p className="text-red-500 text-sm font-poppins">
                    {errors.accountType}
                  </p>
                )}
              </div>
            )}

            {/* Name field (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    size={20}
                    weight="regular"
                    className="text-icon-secondary absolute left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-border-default focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
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
                  className="text-icon-secondary absolute left-4 top-1/2 -translate-y-1/2"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-300 focus:ring-red-200"
                      : "border-border-default focus:ring-primary/20 focus:border-primary"
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
                  className="text-icon-secondary absolute left-4 top-1/2 -translate-y-1/2"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-border-default focus:ring-primary/20 focus:border-primary"
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
                <div className="relative">
                  <LockIcon
                    size={20}
                    weight="regular"
                    className="text-icon-secondary absolute left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-200"
                        : "border-border-default focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm font-poppins">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Forgot password link (login only) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="font-poppins text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-poppins font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRightIcon size={18} weight="bold" />
            </button>
          </form>

          {/* Switch between login/signup */}
          <p className="text-center mt-8 font-poppins text-text-secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setAccountType(null);
              }}
              className="text-primary hover:text-primary-hover font-semibold"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
