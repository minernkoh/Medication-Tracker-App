/**
 * OnboardingTutorial Component - Interactive tutorial for first-time users
 *
 * @param {function} onComplete - Callback when onboarding is completed
 * @param {object} user - User object with name, email, mode
 */
import { useState } from "react";
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
  CalendarBlankIcon,
  StethoscopeIcon,
  MapPinIcon,
  CaretRightIcon,
  CaretUpIcon,
  CaretDownIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { TodayAdherencePieChart } from "../ui";
import { colors } from "../../theme/tokens";
import { getBoxShadow, getAuthData, setAuthData } from "../../utils";
import { getMedicationColor } from "../../utils/medicationColors";

const SUPPLY_DEMO_ROWS = [
  {
    name: "Aspirin",
    supplyStatus: "High",
    supplyStatusColor: "bg-green-100 text-green-700",
    supplyStatusRank: 4,
  },
  {
    name: "Vitamin D",
    supplyStatus: "Med",
    supplyStatusColor: "bg-amber-100 text-amber-700",
    supplyStatusRank: 3,
  },
  {
    name: "Metformin",
    supplyStatus: "Low",
    supplyStatusColor: "bg-red-100 text-red-700",
    supplyStatusRank: 2,
  },
];

function OnboardingTutorial({ onComplete, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const isCaregiver = user?.mode === "Caregiver";
  const [supplySortConfig, setSupplySortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const MedicationPreviewRow = ({ name, dosage }) => {
    const medicationColor = getMedicationColor(name);
    return (
      <div className="bg-background-subtle hover:bg-success-light rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full transition-colors">
        <div className="flex gap-4 items-center w-full sm:w-auto min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: medicationColor.bg }}
            aria-hidden="true"
          >
            <PillIcon size={20} weight="fill" color={medicationColor.icon} />
          </div>
          <div className="flex flex-col items-start justify-center min-w-0">
            <p className="font-poppins font-bold leading-6 text-sm text-text-primary truncate">
              {name}
            </p>
            <p className="font-poppins font-semibold leading-6 text-sm text-text-secondary truncate">
              {dosage}
            </p>
          </div>
        </div>
        <CheckCircleIcon
          size={24}
          weight="regular"
          className={`text-icon-primary ${
            isCaregiver ? "hover:text-secondary" : "hover:text-primary"
          } transition-colors flex-shrink-0`}
        />
      </div>
    );
  };

  const handleSupplySort = (key) => {
    setSupplySortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SupplySortIndicator = ({ columnKey }) => {
    if (supplySortConfig.key !== columnKey) {
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
          <CaretUpIcon size={12} weight="bold" />
        </span>
      );
    }
    return supplySortConfig.direction === "asc" ? (
      <CaretUpIcon
        size={12}
        weight="bold"
        className="ml-1 text-text-secondary"
      />
    ) : (
      <CaretDownIcon
        size={12}
        weight="bold"
        className="ml-1 text-text-secondary"
      />
    );
  };

  const sortedSupplyDemoRows = [...SUPPLY_DEMO_ROWS].sort((a, b) => {
    const multiplier = supplySortConfig.direction === "asc" ? 1 : -1;
    if (supplySortConfig.key === "name") {
      return multiplier * a.name.localeCompare(b.name);
    }
    if (supplySortConfig.key === "supplyStatus") {
      return (
        multiplier * (Number(a.supplyStatusRank) - Number(b.supplyStatusRank))
      );
    }
    return 0;
  });

  const TutorialIllustrationFrame = ({ children }) => (
    <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden">
      {/* Scale illustration to avoid any internal scrolling */}
      <div className="absolute inset-0 p-3 sm:p-4 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center origin-center scale-[0.82] sm:scale-[0.88] md:scale-[0.92] lg:scale-100 [&_img]:max-w-full [&_img]:max-h-full [&_img]:h-auto [&_img]:object-contain">
          {children}
        </div>
      </div>
    </div>
  );

  const allSteps = [
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
          <div
            className={`absolute inset-0 bg-gradient-to-br rounded-3xl ${
              isCaregiver
                ? "from-secondary/10 to-rose-100/50"
                : "from-primary/10 to-blue-100/50"
            }`}
          />
          <div className="relative flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse ${
                isCaregiver
                  ? "bg-secondary shadow-secondary/30"
                  : "bg-primary shadow-primary/30"
              }`}
            >
              <FirstAidKitIcon
                size={32}
                weight="fill"
                color={colors.text.onPrimary}
              />
            </div>
            <div className="text-left">
              <p className="font-poppins font-bold text-2xl text-text-primary">
                MedTracker
              </p>
              <p className="font-poppins text-text-secondary">
                {isCaregiver ? "Caregiver companion" : "Your health companion"}
              </p>
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
                        <UsersIcon
                          size={16}
                          weight="fill"
                          className="flex-shrink-0"
                          color={colors.secondary.DEFAULT}
                        />
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
                        Add Patient
                      </button>
                    </div>

                    {/* Mini table (matches PatientsPage columns) */}
                    <div className="w-full overflow-hidden">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="border-b border-border-default bg-background-subtle">
                            <th className="text-left px-3 py-2.5 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[34%]">
                              Patient
                            </th>
                            <th className="text-left px-3 py-2.5 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[16%]">
                              Meds
                            </th>
                            <th className="text-left px-3 py-2.5 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[26%]">
                              Today
                            </th>
                            <th className="text-left px-3 py-2.5 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[14%]">
                              Next
                            </th>
                            <th className="text-left px-3 py-2.5 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[10%]">
                              Supply
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border-default">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold text-[11px]"
                                  style={{
                                    backgroundColor: colors.patient.blue,
                                  }}
                                >
                                  JD
                                </div>
                                <span className="font-poppins font-semibold text-xs text-text-primary truncate">
                                  John Doe
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <PillIcon
                                  size={14}
                                  weight="regular"
                                  className="text-icon-secondary"
                                />
                                <span className="font-poppins text-xs text-text-primary">
                                  4
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-warning"
                                    style={{ width: "75%" }}
                                  />
                                </div>
                                <span className="font-poppins text-xs font-medium text-warning tabular-nums">
                                  75%
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <CalendarCheckIcon
                                  size={14}
                                  weight="regular"
                                  className="text-icon-secondary"
                                />
                                <span className="font-poppins text-[11px] text-text-primary truncate">
                                  1/15
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 font-poppins text-[11px] font-semibold">
                                <WarningCircleIcon size={12} weight="fill" />1
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-border-default last:border-0">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold text-[11px]"
                                  style={{
                                    backgroundColor: colors.patient.pink,
                                  }}
                                >
                                  JS
                                </div>
                                <span className="font-poppins font-semibold text-xs text-text-primary truncate">
                                  Jane Smith
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <PillIcon
                                  size={14}
                                  weight="regular"
                                  className="text-icon-secondary"
                                />
                                <span className="font-poppins text-xs text-text-primary">
                                  2
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-success"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                                <span className="font-poppins text-xs font-medium text-success tabular-nums">
                                  100%
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-poppins text-[11px] text-text-secondary italic">
                                None
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-poppins text-[11px] font-semibold">
                                <CheckCircleIcon size={12} weight="fill" />
                                Good
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-100/50" />
                <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
                  <div className="bg-background-default border border-border-default rounded-2xl p-4 w-full max-w-full">
                    <div className="flex items-center gap-4 mb-4 min-w-0">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-poppins font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: colors.patient.blue }}
                      >
                        JD
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins font-bold text-base text-text-primary truncate">
                          John Doe
                        </p>
                        <p className="font-poppins text-xs text-text-secondary truncate">
                          Patient overview
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-default border border-border-subtle rounded-xl p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 flex-shrink-0">
                            <CheckCircleIcon
                              size={16}
                              weight="fill"
                              className="text-success"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="font-poppins text-xs font-semibold text-text-primary truncate">
                            Today&apos;s Adherence
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-center">
                          <TodayAdherencePieChart
                            taken={2}
                            notTaken={1}
                            size={56}
                          />
                        </div>
                      </div>

                      <div className="bg-background-default border border-border-subtle rounded-xl p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 flex-shrink-0">
                            <WarningCircleIcon
                              size={16}
                              weight="fill"
                              className="text-danger"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="font-poppins text-xs font-semibold text-text-primary truncate">
                            Low Supply Alerts
                          </p>
                        </div>
                        <div className="mt-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-poppins text-xs font-semibold text-text-primary truncate">
                              Metformin
                            </p>
                            <p className="font-poppins text-[11px] text-text-secondary truncate">
                              Low supply
                            </p>
                          </div>
                          <span className="font-poppins text-xs font-semibold text-danger tabular-nums whitespace-nowrap">
                            15 left
                          </span>
                        </div>
                      </div>
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
      title: isCaregiver
        ? "Manage Daily Medications"
        : "Track Daily Medications",
      subtitle: isCaregiver
        ? "Support your patient’s schedule"
        : "Never miss a dose again",
      description: isCaregiver
        ? "Add and review a patient’s medications, scheduled by specific times. You can mark medications as taken to keep adherence accurate."
        : "Add your medications with dosage and timing. Medications are scheduled by specific times to help you stay on track.",
      illustration: (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-3xl" />
          <div className="relative w-full h-full flex flex-col gap-5 max-w-full px-4 py-4 justify-center">
            {[
              {
                time: "8:00 AM",
                meds: [{ name: "Aspirin", dosage: "100mg" }],
              },
              {
                time: "12:00 PM",
                meds: [{ name: "Vitamin D", dosage: "1000 IU" }],
              },
            ].map((group) => (
              <div key={group.time}>
                <h3 className="font-poppins font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                  <ClockIcon
                    size={16}
                    weight="regular"
                    className={isCaregiver ? "text-secondary" : "text-primary"}
                  />
                  {group.time}
                </h3>
                <div className="space-y-3">
                  {group.meds.map((med) => (
                    <MedicationPreviewRow
                      key={`${group.time}-${med.name}`}
                      name={med.name}
                      dosage={med.dosage}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "supply",
      icon: PackageIcon,
      title: isCaregiver ? "Monitor Patient Supply" : "Monitor Your Supply",
      subtitle: isCaregiver
        ? "Stay ahead for your patient"
        : "Stay on top of your supply",
      description: isCaregiver
        ? "Track a patient’s inventory at a glance. Supply status updates as medications are taken."
        : "View your medication inventory in a simple table. Supply status helps you quickly spot what’s running low.",
      illustration: (
        <div className="relative w-full h-full rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-3xl" />
          <div className="relative w-full h-full px-4 py-4 flex items-center justify-center">
            <div className="bg-background-default border border-border-default rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-border-default bg-background-subtle">
                    <th
                      className="text-left px-3 py-3 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[70%] cursor-pointer hover:text-text-primary transition-colors group select-none"
                      onClick={() => handleSupplySort("name")}
                    >
                      <div className="flex items-center">
                        Medication
                        <SupplySortIndicator columnKey="name" />
                      </div>
                    </th>
                    <th
                      className="text-left px-3 py-3 font-poppins font-semibold text-[11px] text-text-secondary uppercase tracking-wide w-[30%] cursor-pointer hover:text-text-primary transition-colors group select-none"
                      onClick={() => handleSupplySort("supplyStatus")}
                    >
                      <div className="flex items-center">
                        Status
                        <SupplySortIndicator columnKey="supplyStatus" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSupplyDemoRows.map((med, i) => {
                    const medicationColor = getMedicationColor(med.name);
                    return (
                      <tr
                        key={i}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                              style={{ backgroundColor: medicationColor.bg }}
                              aria-hidden="true"
                            >
                              <PillIcon
                                size={18}
                                weight="fill"
                                color={medicationColor.icon}
                              />
                            </div>
                            <span className="font-poppins font-semibold text-xs text-text-primary truncate">
                              {med.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-poppins font-semibold ${med.supplyStatusColor} whitespace-nowrap`}
                          >
                            {med.supplyStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
      subtitle: isCaregiver
        ? "Across all your patients"
        : "Keep your schedule organized",
      description: isCaregiver
        ? "Add and track appointments for each patient. You can review all appointments in one place and filter by patient or status."
        : "Add doctor visits, lab tests, and check-ups. View your upcoming appointments at a glance and stay on top of your healthcare schedule.",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-3xl" />
          <div className="relative w-full max-w-md px-4">
            <div className="bg-background-default border border-border-default rounded-2xl p-5 w-full cursor-pointer group">
              <div className="flex justify-between items-center w-full mb-3">
                <p className="font-poppins font-bold leading-7 text-lg text-text-primary">
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
                  <div className="flex flex-col min-w-0">
                    <p className="font-poppins font-semibold leading-6 text-base text-text-secondary truncate">
                      Mon, Jan 15
                    </p>
                    <p className="font-poppins font-semibold leading-6 text-base text-text-secondary truncate mt-0.5">
                      10:00 AM
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-shrink-0 w-4 h-4">
                    <StethoscopeIcon
                      size={16}
                      weight="regular"
                      color={colors.icon.secondary}
                    />
                  </div>
                  <p className="font-poppins font-semibold leading-6 text-base text-text-secondary">
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
                  <p className="font-poppins font-semibold leading-6 text-base text-text-secondary">
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
      subtitle: isCaregiver
        ? "Spot trends and missed doses"
        : "Celebrate your consistency",
      description: isCaregiver
        ? "Quickly see how a patient is doing today and over time. Trends make it easier to catch issues early and stay consistent."
        : "See your daily medication adherence at a glance. Watch your progress grow as you build healthy habits over time.",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-100/50 rounded-3xl" />
          <div className="relative">
            {/* Progress card matching Dashboard */}
            <div className="bg-background-default border border-border-default flex flex-col gap-3 p-3 rounded-2xl w-56">
              <p className="font-poppins font-semibold text-xs text-text-primary w-full">
                Today&apos;s Progress
              </p>
              {/* Pie Chart and Stats */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
                <TodayAdherencePieChart taken={3} notTaken={1} size={84} />
                {/* Stats */}
                <div className="flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-success" />
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-sm text-text-primary">
                        3
                      </p>
                      <p className="font-poppins text-xs text-text-secondary">
                        Taken
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: "rgba(100,100,100,0.1)" }}
                    />
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-sm text-text-primary">
                        1
                      </p>
                      <p className="font-poppins text-xs text-text-secondary">
                        Pending
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                    <div className="flex flex-col">
                      <p className="font-poppins font-semibold text-sm text-text-primary">
                        4
                      </p>
                      <p className="font-poppins text-xs text-text-secondary">
                        Total Medications
                      </p>
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
                      {
                        name: "John Doe",
                        avatarText: "JD",
                        avatarBg: colors.secondary.DEFAULT,
                        taken: 3,
                        total: 4,
                        nextMed: "12:00 PM",
                      },
                      {
                        name: "Jane Smith",
                        avatarText: "JS",
                        avatarBg: colors.primary.DEFAULT,
                        taken: 2,
                        total: 2,
                        nextMed: null,
                      },
                    ].map((patient, i) => {
                      const completionPercent =
                        patient.total > 0
                          ? Math.round((patient.taken / patient.total) * 100)
                          : 0;
                      return (
                        <div
                          key={i}
                          className="bg-background-default border border-border-default rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-secondary/30 transition-all duration-200 group"
                        >
                          {/* Patient header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold text-lg"
                                style={{ backgroundColor: patient.avatarBg }}
                              >
                                {patient.avatarText}
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-text-primary">
                                  {patient.name}
                                </h3>
                                <p className="font-poppins text-xs text-text-secondary">
                                  {patient.taken}/{patient.total} medications
                                  today
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-poppins text-xs text-text-secondary">
                                Today&apos;s Progress
                              </span>
                              <span
                                className="font-poppins text-xs font-semibold"
                                style={{
                                  color:
                                    completionPercent === 100
                                      ? colors.success.DEFAULT
                                      : colors.secondary.DEFAULT,
                                }}
                              >
                                {completionPercent}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${completionPercent}%`,
                                  backgroundColor:
                                    completionPercent === 100
                                      ? colors.success.DEFAULT
                                      : colors.secondary.DEFAULT,
                                }}
                              />
                            </div>
                          </div>
                          {/* Quick info */}
                          <div className="flex gap-3">
                            {patient.nextMed && (
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg flex-1">
                                <ClockIcon size={14} weight="fill" />
                                <span className="font-poppins text-xs font-medium">
                                  Next: {patient.nextMed}
                                </span>
                              </div>
                            )}
                            {!patient.nextMed &&
                              patient.taken === patient.total && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg flex-1">
                                  <CheckCircleIcon size={14} weight="fill" />
                                  <span className="font-poppins text-xs font-medium">
                                    All done today!
                                  </span>
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
      subtitle: isCaregiver
        ? "Ready to support your loved ones"
        : "Ready to start your health journey",
      description: isCaregiver
        ? "Head to Patients to add your first patient and start managing medications and appointments. You've got this!"
        : "Head to your dashboard to add your first medication. Small steps lead to big health wins!",
      illustration: (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br rounded-3xl ${
              isCaregiver
                ? "from-rose-50 to-pink-100/50"
                : "from-emerald-50 to-green-100/50"
            }`}
          />
          <div className="relative text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: isCaregiver
                  ? colors.secondary.DEFAULT
                  : colors.success.DEFAULT,
                boxShadow: getBoxShadow(
                  isCaregiver
                    ? colors.secondary.DEFAULT
                    : colors.success.DEFAULT,
                  0.4,
                  "lg",
                ),
              }}
            >
              <CheckCircleIcon
                size={32}
                weight="fill"
                color={colors.text.onPrimary}
              />
            </div>
            <p className="font-poppins font-bold text-xl text-text-primary mb-1">
              Welcome aboard, {user?.name?.split(" ")[0] || "friend"}!
            </p>
            <p className="font-poppins text-text-secondary">
              {isCaregiver
                ? "Your caregiving journey starts now"
                : "Your health journey starts now"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Keep caregiver onboarding short: patients → patient detail covers meds/supply/appts/adherence.
  const steps = isCaregiver
    ? allSteps.filter((s) =>
        ["welcome", "patients", "patientDetail", "caregiver", "ready"].includes(
          s.id,
        ),
      )
    : allSteps.filter((s) =>
        [
          "welcome",
          "medications",
          "supply",
          "appointments",
          "progress",
          "ready",
        ].includes(s.id),
      );

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
    <div
      className={`min-h-screen bg-gradient-to-br flex items-center justify-center p-6 ${
        isCaregiver
          ? "from-rose-50 via-pink-50 to-rose-100"
          : "from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      <div className="w-full max-w-5xl">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col md:min-h-[640px]">
          {/* Progress bar (inside card) */}
          <div className="px-6 sm:px-8 md:px-10 pt-6 sm:pt-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-2">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
            {/* Illustration (left on md+) */}
            <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 bg-white flex items-center">
              <TutorialIllustrationFrame>
                {currentStepData.illustration}
              </TutorialIllustrationFrame>
            </div>

            {/* Content + navigation (right on md+) */}
            <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 flex flex-col">
              <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: isCaregiver
                      ? colors.secondary.light
                      : colors.primary.light,
                  }}
                >
                  <IconComponent
                    size={24}
                    weight="fill"
                    color={
                      isCaregiver
                        ? colors.secondary.DEFAULT
                        : colors.primary.DEFAULT
                    }
                  />
                </div>

                <h2 className="font-poppins font-bold text-2xl text-text-primary mb-2 max-w-sm mx-auto">
                  {currentStepData.title}
                </h2>
                <p
                  className="font-poppins font-medium text-sm mb-3 max-w-sm mx-auto"
                  style={{
                    color: isCaregiver
                      ? colors.secondary.DEFAULT
                      : colors.primary.DEFAULT,
                  }}
                >
                  {currentStepData.subtitle}
                </p>
                <p className="font-poppins text-text-secondary leading-relaxed max-w-sm mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="pt-6 w-full grid grid-cols-3 items-center">
                <div className="justify-self-start">
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
                </div>

                <div className="justify-self-center">
                  <button
                    onClick={handleSkip}
                    className="font-poppins font-medium text-sm text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl transition-colors"
                  >
                    {isLastStep ? "Skip" : "Skip Tutorial"}
                  </button>
                </div>

                <div className="justify-self-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 font-poppins font-semibold text-sm text-white px-6 py-2.5 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: isCaregiver
                        ? colors.secondary.DEFAULT
                        : colors.primary.DEFAULT,
                      boxShadow: getBoxShadow(
                        isCaregiver
                          ? colors.secondary.DEFAULT
                          : colors.primary.DEFAULT,
                        0.3,
                        "md",
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
      </div>
    </div>
  );
}

export default OnboardingTutorial;
