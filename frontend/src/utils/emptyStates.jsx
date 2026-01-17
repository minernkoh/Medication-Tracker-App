/**
 * Empty State Presets
 * Predefined empty state configurations for common scenarios
 */

import {
  PillIcon,
  CalendarCheckIcon,
  UsersIcon,
  FileXIcon,
  MagnifyingGlassIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { colors } from "../../tailwind.config.js";
import { Button } from "../components/ui";

/**
 * Get empty state configuration for medications
 */
export function getMedicationsEmptyState(onAddClick) {
  return {
    icon: <PillIcon weight="regular" color={colors.icon.secondary} />,
    title: "No medications yet",
    description:
      "Get started by adding your first medication. Track dosages, schedules, and never miss a dose.",
    action: (
      <Button
        variant="primary"
        onClick={onAddClick}
        icon={<PillIcon size={18} weight="bold" />}
      >
        Add Medication
      </Button>
    ),
  };
}

/**
 * Get empty state configuration for appointments
 */
export function getAppointmentsEmptyState(onAddClick) {
  return {
    icon: (
      <CalendarCheckIcon
        weight="regular"
        color={colors.icon.secondary}
      />
    ),
    title: "No appointments scheduled",
    description:
      "Keep track of your medical appointments. Add your first appointment to get started.",
    action: (
      <Button
        variant="primary"
        onClick={onAddClick}
        icon={<CalendarCheckIcon size={18} weight="bold" />}
      >
        Add Appointment
      </Button>
    ),
  };
}

/**
 * Get empty state configuration for patients (caregiver)
 */
export function getPatientsEmptyState(onAddClick) {
  return {
    icon: (
      <UsersIcon weight="regular" color={colors.icon.secondary} />
    ),
    title: "No patients yet",
    description:
      "Start managing care for your loved ones. Add your first patient to begin tracking their medications and appointments.",
    action: (
      <Button
        variant="secondary"
        onClick={onAddClick}
        icon={<UsersIcon size={18} weight="bold" />}
      >
        Add Patient
      </Button>
    ),
  };
}

/**
 * Get empty state configuration for search results
 */
export function getSearchEmptyState(query) {
  return {
    icon: (
      <MagnifyingGlassIcon
        weight="regular"
        color={colors.icon.secondary}
      />
    ),
    title: "No results found",
    description: query
      ? `No results found for "${query}". Try adjusting your search terms.`
      : "No results match your search criteria.",
  };
}

/**
 * Get empty state configuration for supply medications
 */
export function getSupplyEmptyState(onAddClick) {
  return {
    icon: (
      <PackageIcon weight="regular" color={colors.icon.secondary} />
    ),
    title: "No medications in supply",
    description:
      "Track your medication inventory to stay on top of refills and never run out.",
    action: (
      <Button
        variant="primary"
        onClick={onAddClick}
        icon={<PackageIcon size={18} weight="bold" />}
      >
        Add to Supply
      </Button>
    ),
  };
}

/**
 * Get empty state configuration for generic "no data" state
 */
export function getGenericEmptyState(title = "No data available", description) {
  return {
    icon: (
      <FileXIcon weight="regular" color={colors.icon.secondary} />
    ),
    title,
    description: description || "There's nothing here yet. Check back later.",
  };
}
