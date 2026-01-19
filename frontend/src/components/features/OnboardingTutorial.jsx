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
  PlusIcon,
  MagnifyingGlassIcon,
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

  const TutorialIllustrationFrame = ({ children }) => (
    <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden">
      {/* Scale illustration to avoid any internal scrolling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center origin-center scale-[0.82] sm:scale-[0.88] md:scale-[0.92] lg:scale-100 [&_img]:max-w-full [&_img]:max-h-full [&_img]:h-auto [&_img]:object-contain">
          {children}
        </div>
      </div>
    </div>
  );

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
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
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
    ...(isCaregiver
      ? [
          {
            id: "patients",
            icon: UsersIcon,
            title: "Add & Manage Patients",
            subtitle: "Your care circle, in one place",
            description:
              "Use the Patients page to add a patient by email, then select a patient to manage their medications, supply, appointments, and adherence.",
            illustration: (
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-100/50" />
                <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
                  <div className="bg-background-default border border-border-default rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
                    {/* Header row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-background-subtle">
                      <div className="flex items-center gap-2 min-w-0">
                        <UsersIcon size={16} weight="fill" className="flex-shrink-0" color={colors.secondary.DEFAULT} />
                        <p className="font-poppins font-semibold text-sm text-text-primary truncate">
                          My Patients
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-poppins font-semibold text-xs text-white flex-shrink-0"
                        style={{ backgroundColor: colors.secondary.DEFAULT }}
                        aria-label="Add patient"
                      >
                        <PlusIcon size={14} weight="bold" />
                        Add
                      </button>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-border-default">
                      <div className="relative w-full">
                        <MagnifyingGlassIcon
                          size={16}
                          weight="regular"
                          color={colors.text.secondary}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                        />
                        <div className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-white font-poppins text-xs text-text-secondary/70">
                          Search patients…
                        </div>
                      </div>
                    </div>

                    {/* Mini list */}
                    <div className="divide-y divide-border-default">
                      {[
                        { name: "John Doe", initials: "JD", alerts: 1, adherence: 75, color: colors.patient.blue },
                        { name: "Jane Smith", initials: "JS", alerts: 0, adherence: 100, color: colors.patient.pink },
                      ].map((p) => (
                        <div key={p.initials} className="px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-poppins font-bold text-xs flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            >
                              {p.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-poppins font-semibold text-sm text-text-primary truncate">{p.name}</p>
                              <p className="font-poppins text-xs text-text-secondary truncate">
                                {p.adherence}% adherence today
                              </p>
                            </div>
                          </div>
                          {p.alerts > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-poppins text-xs font-semibold flex-shrink-0">
                              <WarningCircleIcon size={12} weight="fill" />
                              {p.alerts} alert
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-poppins text-xs font-semibold flex-shrink-0">
                              <CheckCircleIcon size={12} weight="fill" />
                              Good
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "patientDetail",
            icon: HeartIcon,
            title: "Patient Details",
            subtitle: "Everything you need on one screen",
            description:
              "Open a patient to view today’s meds, update taken status, track supply, and manage upcoming appointments—all in one place.",
            illustration: (
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-100/50" />
                <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
                  <div className="bg-background-default border border-border-default rounded-2xl p-4 w-full max-w-full">
                    <div className="flex items-center gap-3 mb-4 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-poppins font-bold flex-shrink-0"
                        style={{ backgroundColor: colors.patient.blue }}
                      >
                        JD
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins font-bold text-text-primary truncate">John (John Doe)</p>
                        <p className="font-poppins text-xs text-text-secondary truncate">Son • 72 years old</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-subtle rounded-xl p-3">
                        <p className="font-poppins text-xs text-text-secondary">Today</p>
                        <p className="font-poppins font-bold text-text-primary">2/3</p>
                      </div>
                      <div className="bg-background-subtle rounded-xl p-3">
                        <p className="font-poppins text-xs text-text-secondary">Weekly</p>
                        <p className="font-poppins font-bold text-text-primary">86%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between bg-amber-50 text-amber-700 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <WarningCircleIcon size={16} weight="fill" className="flex-shrink-0" />
                        <p className="font-poppins text-xs font-semibold truncate">Low supply: Metformin</p>
                      </div>
                      <span className="font-poppins text-xs font-bold flex-shrink-0">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "medications",
      icon: PillIcon,
      title: isCaregiver ? "Manage Daily Medications" : "Track Daily Medications",
      subtitle: isCaregiver ? "Support your patient’s schedule" : "Never miss a dose again",
      description: isCaregiver
        ? "Add and review a patient’s medications, organized by time of day. You can mark medications as taken to keep adherence accurate."
        : "Add your medications with dosage and timing. Medications are organized by time of day (Morning, Afternoon, Night) to help you stay on schedule.",
      illustration: (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-3xl" />
          <div className="relative w-full h-full flex flex-col gap-5 max-w-full px-4 py-4 justify-center">
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
      title: isCaregiver ? "Monitor Supply & Refills" : "Monitor Your Supply",
      subtitle: isCaregiver ? "Stay ahead for your patient" : "Stay ahead of refills",
      description: isCaregiver
        ? "Track a patient’s inventory and refill dates. Supply status updates automatically as medications are marked as taken."
        : "View your medication inventory in a table format. Supply status is calculated as a percentage when you mark medications as taken, helping you track how much you have remaining.",
      illustration: (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-3xl" />
          <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
            <div className="bg-background-default border border-border-default rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-border-default bg-background-subtle">
                    <th className="text-left px-3 py-3 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-1/2">
                      Medication
                    </th>
                    <th className="text-left px-3 py-3 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-1/4">
                      Qty
                    </th>
                    <th className="text-left px-3 py-3 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-1/4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Aspirin", qty: "45", status: "75%", statusColor: "bg-green-100 text-green-700", iconColor: colors.success.DEFAULT },
                    { name: "Vitamin D", qty: "30", status: "50%", statusColor: "bg-amber-100 text-amber-700", iconColor: colors.warning.DEFAULT },
                    { name: "Metformin", qty: "15", status: "25%", statusColor: "bg-red-100 text-red-700", iconColor: colors.danger.DEFAULT },
                  ].map((med, i) => (
                    <tr key={i} className="border-b border-border-default last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                            style={{ backgroundColor: `${med.iconColor}15` }}
                          >
                            <PillIcon size={18} weight="fill" color={med.iconColor} />
                          </div>
                          <span className="font-poppins font-semibold text-xs text-text-primary truncate">
                            {med.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-poppins text-xs font-medium text-text-primary truncate">
                          {med.qty}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-poppins font-semibold ${med.statusColor} whitespace-nowrap`}>
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
      title: isCaregiver ? "Manage Appointments" : "Manage Appointments",
      subtitle: isCaregiver ? "Across all your patients" : "Keep your schedule organized",
      description: isCaregiver
        ? "Add and track appointments for each patient. You can review all appointments in one place and filter by patient or status."
        : "Add doctor visits, lab tests, and check-ups. View your upcoming appointments at a glance and stay on top of your healthcare schedule.",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
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
      title: isCaregiver ? "Monitor Adherence" : "Track Your Progress",
      subtitle: isCaregiver ? "Spot trends and missed doses" : "Celebrate your consistency",
      description: isCaregiver
        ? "Quickly see how a patient is doing today and over time. Trends make it easier to catch issues early and stay consistent."
        : "See your daily medication adherence at a glance. Watch your progress grow as you build healthy habits over time.",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
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
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-100/50 rounded-3xl" />
                <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
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
        ? "Head to Patients to add your first patient and start managing medications and appointments. You've got this!"
        : "Head to your dashboard to add your first medication. Small steps lead to big health wins!",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
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
      <div className="w-full max-w-5xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Illustration (left on md+) */}
            <div className="p-6 sm:p-8 md:p-10 bg-white">
              <TutorialIllustrationFrame>
                {currentStepData.illustration}
              </TutorialIllustrationFrame>
            </div>

            {/* Content + navigation (right on md+) */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col">
              <div className="flex-1 text-center md:text-left">
                <div
                  className="w-12 h-12 rounded-xl mx-auto md:mx-0 mb-4 flex items-center justify-center"
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
                <p className="font-poppins text-text-secondary leading-relaxed max-w-md md:max-w-none md:pr-2 mx-auto md:mx-0">
                  {currentStepData.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="pt-6 flex items-center justify-between">
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
