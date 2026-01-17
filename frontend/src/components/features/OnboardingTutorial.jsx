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
  SunIcon,
  SunDimIcon,
  MoonIcon,
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
  ClockIcon,
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
        <div className="relative w-full h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100/50 rounded-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
              <FirstAidKitIcon size={32} weight="fill" color={colors.text.onPrimary} />
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
        "Add your medications with dosage and timing. Medications are organized by time of day (Morning, Afternoon, Night) to help you stay on schedule.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-3xl" />
          <div className="relative flex flex-col gap-6 w-full max-w-md px-4 py-4">
            {/* Time group: Morning */}
            <div>
              <h3 className="font-poppins font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                <SunIcon size={16} weight="regular" className="text-blue-500" />
                Morning
              </h3>
              <div className="space-y-3">
                <div className="bg-background-subtle hover:bg-success-light rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full transition-colors">
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm flex-shrink-0">
                      <PillIcon size={20} weight="fill" color={colors.success.DEFAULT} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="font-poppins font-bold leading-6 text-sm text-text-primary">Aspirin</p>
                      <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">100mg</p>
                    </div>
                  </div>
                  <CheckCircleIcon size={24} weight="regular" className="text-icon-primary hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            </div>
            {/* Time group: Afternoon */}
            <div>
              <h3 className="font-poppins font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                <SunDimIcon size={16} weight="regular" className="text-amber-500" />
                Afternoon
              </h3>
              <div className="space-y-3">
                <div className="bg-background-subtle hover:bg-success-light rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full transition-colors">
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm flex-shrink-0">
                      <PillIcon size={20} weight="fill" color={colors.warning.DEFAULT} />
                    </div>
                    <div className="flex flex-col items-start justify-center">
                      <p className="font-poppins font-bold leading-6 text-sm text-text-primary">Vitamin D</p>
                      <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">1000 IU</p>
                    </div>
                  </div>
                  <CheckCircleIcon size={24} weight="regular" className="text-icon-primary hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "supply",
      icon: PackageIcon,
      title: "Monitor Your Supply",
      subtitle: "Stay ahead of refills",
      description:
        "View your medication inventory in a table format. Supply status is calculated as a percentage when you mark medications as taken, helping you track how much you have remaining.",
      illustration: (
        <div className="relative w-full h-48 flex items-center justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-3xl" />
          <div className="relative w-full max-w-2xl px-4">
            <div className="bg-background-default border border-border-default rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default bg-background-subtle">
                    <th className="text-left px-5 py-4 font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                      Medication
                    </th>
                    <th className="text-left px-5 py-4 font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                      Current Quantity
                    </th>
                    <th className="text-left px-5 py-4 font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide">
                      Supply Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Aspirin", qty: "45 pills", status: "75%", statusColor: "bg-green-100 text-green-700", iconColor: colors.success.DEFAULT },
                    { name: "Vitamin D", qty: "30 pills", status: "50%", statusColor: "bg-amber-100 text-amber-700", iconColor: colors.warning.DEFAULT },
                    { name: "Metformin", qty: "15 pills", status: "25%", statusColor: "bg-red-100 text-red-700", iconColor: colors.danger.DEFAULT },
                  ].map((med, i) => (
                    <tr key={i} className="border-b border-border-default last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${med.iconColor}15` }}>
                            <PillIcon size={20} weight="fill" color={med.iconColor} />
                          </div>
                          <span className="font-poppins font-semibold text-sm text-text-primary">{med.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-poppins text-sm font-medium text-text-primary">{med.qty}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-poppins font-medium ${med.statusColor}`}>
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <div className="relative w-full h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-3xl" />
          <div className="relative w-full max-w-md px-4">
            <div className="bg-background-default border border-border-default rounded-2xl p-5 w-full cursor-pointer group">
              <div className="flex justify-between items-center w-full mb-2">
                <p className="font-poppins font-bold leading-6 text-base text-text-primary">
                  Upcoming Appointment
                </p>
                <CaretRightIcon
                  size={20}
                  weight="regular"
                  className="text-text-secondary group-hover:text-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="font-poppins font-bold leading-none text-xl text-text-primary w-full">
                  Annual Check-up
                </p>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-shrink-0 w-4 h-4">
                    <CalendarBlankIcon
                      size={16}
                      weight="regular"
                      color={colors.icon.secondary}
                    />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                    Mon, Jan 15 • 10:00 AM
                  </p>
                </div>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-shrink-0 w-4 h-4">
                    <StethoscopeIcon
                      size={16}
                      weight="regular"
                      color={colors.icon.secondary}
                    />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                    Dr. Sarah Johnson
                  </p>
                </div>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-shrink-0 w-4 h-4">
                    <MapPinIcon
                      size={16}
                      weight="regular"
                      color={colors.icon.secondary}
                    />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary">
                    123 Medical Center
                  </p>
                </div>
              </div>
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
        <div className="relative w-full h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-100/50 rounded-3xl" />
          <div className="relative">
            {/* Progress card matching Dashboard */}
            <div className="bg-background-default border border-border-default flex flex-col gap-4 p-4 rounded-2xl w-64">
              <p className="font-poppins font-semibold text-sm text-text-primary w-full">
                Today's Progress
              </p>
              {/* Pie Chart and Stats */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                {/* Pie Chart - Donut chart */}
                <div className="flex items-center justify-center" style={{ width: 100, height: 100 }}>
                  <svg width={100} height={100} viewBox="0 0 140 140">
                    <circle cx={70} cy={70} r={66} fill={colors.background.subtle} />
                    <circle cx={70} cy={70} r={40} fill={colors.background.default} />
                    {/* Not taken segment (gray) */}
                    <path
                      d="M 70 4 A 66 66 0 0 1 70 136 L 70 100 A 40 40 0 0 0 70 40 Z"
                      fill={colors.border.subtle}
                      fillRule="evenodd"
                    />
                    {/* Taken segment (green) */}
                    <path
                      d="M 70 4 A 66 66 0 0 1 136 70 L 100 70 A 40 40 0 0 0 70 40 Z"
                      fill={colors.success.DEFAULT}
                    />
                    {/* Center text */}
                    <text x={70} y={65} textAnchor="middle" className="font-poppins font-bold text-lg" fill={colors.text.primary}>
                      75%
                    </text>
                    <text x={70} y={82} textAnchor="middle" className="font-poppins text-xs" fill={colors.text.secondary}>
                      Complete
                    </text>
                  </svg>
                </div>
                {/* Stats */}
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-base text-text-primary">3</p>
                      <p className="font-poppins text-sm text-text-secondary">Taken</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(100,100,100,0.1)" }} />
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-base text-text-primary">1</p>
                      <p className="font-poppins text-sm text-text-secondary">Pending</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-base text-text-primary">4</p>
                      <p className="font-poppins text-sm text-text-secondary">Total Medications</p>
                    </div>
                  </div>
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
              <div className="relative w-full h-48 flex items-center justify-center overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-100/50 rounded-3xl" />
                <div className="relative w-full max-w-2xl px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {[
                      { name: "John Doe", initials: "JD", color: colors.secondary.DEFAULT, taken: 3, total: 4, nextMed: "12:00 PM" },
                      { name: "Jane Smith", initials: "JS", color: colors.primary.DEFAULT, taken: 2, total: 2, nextMed: null },
                    ].map((patient, i) => {
                      const completionPercent = patient.total > 0 ? Math.round((patient.taken / patient.total) * 100) : 0;
                      return (
                        <div
                          key={i}
                          className="bg-background-default border border-border-default rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-secondary/30 transition-all duration-200 group"
                        >
                          {/* Patient header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-poppins font-bold text-lg"
                                style={{ backgroundColor: patient.color }}
                              >
                                {patient.initials}
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-text-primary">{patient.name}</h3>
                                <p className="font-poppins text-xs text-text-secondary">
                                  {patient.taken}/{patient.total} medications today
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-poppins text-xs text-text-secondary">Today's Progress</span>
                              <span
                                className="font-poppins text-xs font-semibold"
                                style={{ color: completionPercent === 100 ? colors.success.DEFAULT : colors.secondary.DEFAULT }}
                              >
                                {completionPercent}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${completionPercent}%`,
                                  backgroundColor: completionPercent === 100 ? colors.success.DEFAULT : colors.secondary.DEFAULT,
                                }}
                              />
                            </div>
                          </div>
                          {/* Quick info */}
                          <div className="flex gap-3">
                            {patient.nextMed && (
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg flex-1">
                                <ClockIcon size={14} weight="fill" />
                                <span className="font-poppins text-xs font-medium">Next: {patient.nextMed}</span>
                              </div>
                            )}
                            {!patient.nextMed && patient.taken === patient.total && (
                              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg flex-1">
                                <CheckCircleIcon size={14} weight="fill" />
                                <span className="font-poppins text-xs font-medium">All done today!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
        <div className="relative w-full h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-3xl" />
          <div className="relative text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: isCaregiver ? colors.secondary.DEFAULT : colors.success.DEFAULT,
                boxShadow: getBoxShadow(
                  isCaregiver ? colors.secondary.DEFAULT : colors.success.DEFAULT,
                  0.4,
                  "lg"
                ),
              }}
            >
              <CheckCircleIcon size={32} weight="fill" color={colors.text.onPrimary} />
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
