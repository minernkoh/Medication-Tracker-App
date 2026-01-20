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
  PackageIcon,
  CalendarCheckIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";
import { useError } from "../../contexts/ErrorContext";

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
  const { showError } = useError();

  const isCaregiverSelected = accountType === "caregiver";
  const leftPanelContent = isCaregiverSelected
    ? {
        subtitle: "Caregiver companion",
        headline: "Support your loved ones with confidence",
        body:
          "Monitor medications and appointments across patients, and spot issues early.",
        features: [
          {
            icon: UsersIcon,
            title: "Patients overview",
            description: "Manage multiple patients with a consolidated view.",
          },
          {
            icon: HeartIcon,
            title: "Adherence tracking",
            description: "See daily progress and identify missed doses quickly.",
          },
          {
            icon: CalendarCheckIcon,
            title: "Appointment coordination",
            description: "Keep upcoming appointments organized for each patient.",
          },
        ],
      }
    : {
        subtitle: "Your health companion",
        headline: "Track your health journey with confidence",
        body:
          "Never miss a medication or appointment again. MedTracker helps you stay on top of your health.",
        features: [
          {
            icon: PackageIcon,
            title: "Supply Management",
            description: "Track medication inventory and refills",
          },
          {
            icon: CalendarCheckIcon,
            title: "Appointment Tracking",
            description: "Keep all your appointments organized",
          },
          {
            icon: HeartIcon,
            title: "Health Insights",
            description: "Track your progress over time",
          },
        ],
      };

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

    // Account type is required for signup, but optional for signin
    // When signing in without selecting a role, backend will find the user by email alone
    if (!isLogin && !accountType) {
      newErrors.accountType = "Please select an account type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const isFirstTime = !isLogin;
      try {
        if (isFirstTime) {
          await onSignup?.({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: accountType,
          });
        } else {
          await onLogin?.({
            email: formData.email,
            password: formData.password,
            role: accountType,
          });
        }
      } catch (error) {
        showError(error?.message || "Authentication failed");
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
      className={`flex-1 p-5 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg min-h-[140px] flex flex-col ${
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
      <p className="font-poppins text-sm text-text-secondary leading-relaxed flex-1">
        {description}
      </p>
      <div
        className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold h-5 ${
          selected
            ? type === "patient"
              ? "text-primary"
              : "text-secondary"
            : "text-transparent"
        }`}
      >
        <CheckIcon size={16} weight="bold" />
        Selected
      </div>
    </button>
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br flex ${
        isCaregiverSelected
          ? "from-rose-50 via-pink-50 to-rose-100"
          : "from-slate-50 via-blue-50 to-indigo-50"
      }`}
      style={{ overflowY: "auto", height: "100vh" }}
    >
      {/* Left side - Decorative */}
      <div
        className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br p-12 flex-col justify-between relative overflow-hidden ${
          isCaregiverSelected
            ? "from-secondary via-pink-600 to-rose-700"
            : "from-primary via-blue-600 to-indigo-700"
        }`}
      >
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
              {leftPanelContent.subtitle}
            </p>
          </div>
        </div>

        {/* Features showcase */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-poppins font-bold text-4xl text-white leading-tight mb-4">
              {leftPanelContent.headline}
            </h2>
            <p className="font-poppins text-white/80 text-lg leading-relaxed max-w-md">
              {leftPanelContent.body}
            </p>
          </div>

          <div className="space-y-4">
            {leftPanelContent.features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon
                    size={20}
                    weight="fill"
                    color={colors.text.onPrimary}
                  />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-white">
                    {feature.title}
                  </p>
                  <p className="font-poppins text-white/70 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-poppins text-white/50 text-sm">
          © {new Date().getFullYear()} MedTracker. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isCaregiverSelected ? "bg-secondary" : "bg-primary"
              }`}
            >
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
                ? isCaregiverSelected
                  ? "Sign in to manage care for someone else"
                  : "Sign in to continue managing your health"
                : isCaregiverSelected
                  ? "Start supporting someone’s health today"
                  : "Start your health journey today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account type selection - Required for signup, optional for signin */}
            <div className="space-y-3">
              <label className="font-poppins font-semibold text-sm text-text-primary">
                {isLogin ? "Account Type (Optional)" : "I am a..."}
              </label>
              <p className="font-poppins text-xs text-text-secondary">
                {isLogin
                  ? "If you have multiple accounts, select which one to access"
                  : "Select the type of account you want to create"}
              </p>
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
                        : isCaregiverSelected
                          ? "border-border-default focus:ring-secondary/20 focus:border-secondary"
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
                      : isCaregiverSelected
                        ? "border-border-default focus:ring-secondary/20 focus:border-secondary"
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
                      : isCaregiverSelected
                        ? "border-border-default focus:ring-secondary/20 focus:border-secondary"
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
                        : isCaregiverSelected
                          ? "border-border-default focus:ring-secondary/20 focus:border-secondary"
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
                  className={`font-poppins text-sm font-medium ${
                    isCaregiverSelected
                      ? "text-secondary hover:text-secondary-hover"
                      : "text-primary hover:text-primary-hover"
                  }`}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={`w-full text-white font-poppins font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                isCaregiverSelected
                  ? "bg-secondary hover:bg-secondary-hover shadow-secondary/25 hover:shadow-secondary/30"
                  : "bg-primary hover:bg-primary-hover shadow-primary/25 hover:shadow-primary/30"
              }`}
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
              className={`font-semibold ${
                isCaregiverSelected
                  ? "text-secondary hover:text-secondary-hover"
                  : "text-primary hover:text-primary-hover"
              }`}
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
