/**
 * OnboardingTutorial Component - Interactive tutorial for first-time users
 *
 * @param {function} onComplete - Callback when onboarding is completed
 * @param {object} user - User object with name, email, mode
 */
import React, { useState } from "react";
import {
  PillIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  UsersIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  SparkleIcon,
  FirstAidKitIcon,
  PackageIcon,
  WarningCircleIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import { colors } from "../../../tailwind.config.js";
import { getBoxShadow, getAuthData, setAuthData } from "../../utils";

function OnboardingTutorial({ onComplete, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const isCaregiver = user?.mode === "Caregiver";

  const steps = [
    {
      id: "welcome",
      icon: SparkleIcon,
      title: `Welcome, ${user?.name?.split(" ")[0] || "there"}!`,
      subtitle: "Let's get you started with MedTracker",
      description: isCaregiver
        ? "As a caregiver, you'll be able to manage medications and appointments for your loved ones. Let's walk through the key features."
        : "You're all set to start tracking your health journey. Let's walk through the key features together.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100/50 rounded-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
              <FirstAidKitIcon size={48} weight="fill" color={colors.text.onPrimary} />
            </div>
            <div className="text-left">
              <p className="font-poppins font-bold text-2xl text-text-primary">MedTracker</p>
              <p className="font-poppins text-text-secondary">Your health companion</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "medications",
      icon: PillIcon,
      title: "Track Daily Medications",
      subtitle: "Never miss a dose again",
      description:
        "Add your medications with dosage and timing. Each day, mark medications as taken to build healthy habits and stay on schedule.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-3xl" />
          <div className="relative flex flex-col gap-3 w-full max-w-xs px-4">
            {/* Medication illustration cards */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`medication-placeholder-${i}`}
                className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-3"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animation: "slideInRight 0.5s ease-out forwards",
                  opacity: 0,
                }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    i % 2 === 0 ? "bg-emerald-100" : "bg-amber-100"
                  }`}
                >
                  <PillIcon
                    size={20}
                    weight="fill"
                    color={i % 2 === 0 ? colors.success.DEFAULT : colors.warning.DEFAULT}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-poppins font-semibold text-sm text-text-primary">
                    Medication
                  </p>
                  <p className="font-poppins text-xs text-text-secondary">
                    Dosage • Time
                  </p>
                </div>
                {i % 2 === 0 ? (
                  <CheckCircleIcon size={24} weight="fill" color={colors.success.DEFAULT} />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-amber-400" />
                )}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </div>
      ),
    },
    {
      id: "supply",
      icon: PackageIcon,
      title: "Monitor Your Supply",
      subtitle: "Stay ahead of refills",
      description:
        "Keep track of how many pills you have left. Get a clear overview of your current supply so you never run out unexpectedly.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-3xl" />
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-5 w-80">
              <div className="flex items-center justify-between mb-4">
                <span className="font-poppins font-bold text-text-primary">Current Supply</span>
                <PackageIcon size={24} weight="fill" color={colors.warning.DEFAULT} />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`supply-placeholder-${i}`} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-poppins text-sm text-text-primary">
                      Supply item
                    </span>
                    <span
                      className="font-poppins text-xs font-semibold"
                      style={{
                        color:
                          i === 0
                            ? colors.success.DEFAULT
                            : i === 1
                            ? colors.warning.DEFAULT
                            : colors.danger.DEFAULT,
                      }}
                    >
                      Remaining
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${60 - i * 15}%`,
                        backgroundColor:
                          i === 0
                            ? colors.success.DEFAULT
                            : i === 1
                            ? colors.warning.DEFAULT
                            : colors.danger.DEFAULT,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-border-default flex items-center gap-2">
                <WarningCircleIcon size={16} weight="fill" color={colors.danger.DEFAULT} />
                <span className="font-poppins text-xs text-danger font-medium">
                  Refill reminders appear here
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "appointments",
      icon: CalendarCheckIcon,
      title: "Manage Appointments",
      subtitle: "Keep your schedule organized",
      description:
        "Add doctor visits, lab tests, and check-ups. View your upcoming appointments at a glance and stay on top of your healthcare schedule.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-3xl" />
          <div className="relative">
            {/* Appointment illustration card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 w-80">
              <div className="flex items-center justify-between mb-4">
                <span className="font-poppins font-bold text-text-primary">Upcoming</span>
                <CalendarCheckIcon size={24} weight="fill" color={colors.primary.DEFAULT} />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={`appointment-placeholder-${i}`}
                  className={`flex items-center gap-4 py-3 ${
                    i > 0 ? "border-t border-border-default" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                    <span className="font-poppins text-xs text-primary font-semibold">
                      Date
                    </span>
                    <span className="font-poppins text-lg text-primary font-bold leading-tight">
                      --
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-poppins font-semibold text-sm text-text-primary">
                      Appointment
                    </p>
                    <p className="font-poppins text-xs text-text-secondary">
                      Provider • Time
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "progress",
      icon: ChartLineUpIcon,
      title: "Track Your Progress",
      subtitle: "Celebrate your consistency",
      description:
        "See your daily medication adherence at a glance. Watch your progress grow as you build healthy habits over time.",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-100/50 rounded-3xl" />
          <div className="relative">
            {/* Progress illustration chart */}
            <div className="bg-white rounded-2xl shadow-xl p-5 w-72">
              <div className="flex items-center justify-between mb-4">
                <span className="font-poppins font-bold text-text-primary">This Week</span>
                <span className="font-poppins text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                  Adherence summary
                </span>
              </div>
              <div className="flex items-end justify-between h-24 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={`progress-placeholder-${i}`}
                    className="flex-1 rounded-t-lg transition-all"
                    style={{
                      height: `${60 + i * 5}%`,
                      background: `linear-gradient(to top, ${colors.primary.DEFAULT}, ${colors.primary.hover})`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span
                    key={i}
                    className="font-poppins text-xs text-text-secondary flex-1 text-center"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-primary to-blue-400" />
                  <span className="font-poppins text-xs text-text-secondary">Partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-400" />
                  <span className="font-poppins text-xs text-text-secondary">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    ...(isCaregiver
      ? [
          {
            id: "caregiver",
            icon: UsersIcon,
            title: "Caregiver Dashboard",
            subtitle: "Care for your loved ones",
            description:
              "View all your patients at a glance. Track their medications, appointments, and progress from one central dashboard.",
            illustration: (
              <div className="relative w-full h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-100/50 rounded-3xl" />
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-5 w-80">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-poppins font-bold text-text-primary">Your Patients</span>
                      <HeartIcon size={24} weight="fill" color={colors.secondary.DEFAULT} />
                    </div>
                    <div className="flex gap-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={`patient-placeholder-${i}`}
                          className="flex-1 bg-gray-50 rounded-xl p-4 text-center"
                        >
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-poppins font-bold text-lg"
                            style={{
                              backgroundColor:
                                i === 0
                                  ? colors.secondary.DEFAULT
                                  : colors.primary.DEFAULT,
                            }}
                          >
                            P
                          </div>
                          <p className="font-poppins font-semibold text-sm text-text-primary">
                            Patient
                          </p>
                          <p className="font-poppins text-xs text-text-secondary mt-1">
                            Medications
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <CheckCircleIcon
                              size={14}
                              weight="fill"
                              color={colors.success.DEFAULT}
                            />
                            <span className="font-poppins text-xs text-emerald-600 font-semibold">
                              Adherence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "ready",
      icon: CheckCircleIcon,
      title: "You're All Set!",
      subtitle: "Ready to start your health journey",
      description: isCaregiver
        ? "Head to your dashboard to add patients and start managing their medications. You've got this!"
        : "Head to your dashboard to add your first medication. Small steps lead to big health wins!",
      illustration: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-3xl" />
          <div className="relative text-center">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: isCaregiver ? colors.secondary.DEFAULT : colors.success.DEFAULT,
                boxShadow: getBoxShadow(
                  isCaregiver ? colors.secondary.DEFAULT : colors.success.DEFAULT,
                  0.4,
                  "lg"
                ),
              }}
            >
              <CheckCircleIcon size={48} weight="fill" color={colors.text.onPrimary} />
            </div>
            <p className="font-poppins font-bold text-xl text-text-primary mb-1">
              Welcome aboard, {user?.name?.split(" ")[0] || "friend"}!
            </p>
            <p className="font-poppins text-text-secondary">
              Your health journey starts now
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.(user);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    // Mark onboarding as skipped in localStorage
    const existing = getAuthData();
    if (existing) {
      setAuthData({
        ...existing,
        onboardingSkipped: true,
        onboardingCompleted: false,
      });
    }
    onComplete?.(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  index <= currentStep
                    ? isCaregiver
                      ? colors.secondary.DEFAULT
                      : colors.primary.DEFAULT
                    : colors.background.subtle,
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
          {/* Illustration area */}
          <div className="p-8 pb-0">{currentStepData.illustration}</div>

          {/* Content */}
          <div className="p-8 pt-6 text-center">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: isCaregiver ? colors.secondary.light : colors.primary.light,
              }}
            >
              <IconComponent
                size={24}
                weight="fill"
                color={isCaregiver ? colors.secondary.DEFAULT : colors.primary.DEFAULT}
              />
            </div>

            <h2 className="font-poppins font-bold text-2xl text-text-primary mb-2">
              {currentStepData.title}
            </h2>
            <p
              className="font-poppins font-medium text-sm mb-3"
              style={{ color: isCaregiver ? colors.secondary.DEFAULT : colors.primary.DEFAULT }}
            >
              {currentStepData.subtitle}
            </p>
            <p className="font-poppins text-text-secondary leading-relaxed max-w-md mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="p-8 pt-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 font-poppins font-medium text-sm px-4 py-2.5 rounded-xl transition-all ${
                currentStep === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-text-secondary hover:bg-gray-100"
              }`}
            >
              <ArrowLeftIcon size={16} weight="bold" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="font-poppins font-medium text-sm text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl transition-colors"
              >
                {isLastStep ? "Skip" : "Skip Tutorial"}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 font-poppins font-semibold text-sm text-white px-6 py-2.5 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isCaregiver
                    ? colors.secondary.DEFAULT
                    : colors.primary.DEFAULT,
                  boxShadow: getBoxShadow(
                    isCaregiver ? colors.secondary.DEFAULT : colors.primary.DEFAULT,
                    0.3,
                    "md"
                  ),
                }}
              >
                {isLastStep ? "Get Started" : "Next"}
                <ArrowRightIcon size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-center font-poppins text-sm text-text-secondary mt-6">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}

export default OnboardingTutorial;
