/**
 * MedicationsContext - Global medications state management
 * Provides shared medication state across Dashboard and MedicationPage
 * Handles syncing quantity changes when medications are marked as taken/pending
 */

import React, { createContext, useContext, useState, useCallback } from "react";

const MedicationsContext = createContext(null);

export function MedicationsProvider({ children }) {
  // State to track medications - initially populated with sample data
  const [medications, setMedications] = useState([
    // Pending medications (for today)
    {
      id: 1,
      name: "Paracetamol",
      dosage: "2 pills",
      timeOfDay: "08:00",
      quantity: "50 pills",
      status: "pending",
      taken: false,
      takenTime: null,
      additionalInfo: "For headache",
      lastQuantityDelta: 0,
    },
    {
      id: 2,
      name: "Ibuprofen",
      dosage: "1 pill",
      timeOfDay: "13:00",
      quantity: "30 pills",
      status: "pending",
      taken: false,
      additionalInfo: "After Meal",
      pillColor: "#ffd5d5",
      lastQuantityDelta: 0,
    },
    {
      id: 3,
      name: "Vitamin C",
      dosage: "1 pill",
      timeOfDay: "20:00",
      quantity: "45 pills",
      status: "pending",
      taken: false,
      additionalInfo: "Before Sleep",
      pillColor: "#d9ffaf",
      lastQuantityDelta: 0,
    },
    // Taken medications (example of already taken today)
    {
      id: 4,
      name: "Aspirin",
      dosage: "1 pill",
      timeOfDay: "08:00",
      quantity: "99 pills",
      status: "taken",
      taken: true,
      takenTime: "9:00 AM",
      additionalInfo: "",
      lastQuantityDelta: -1,
    },
    // Supply-only medications
    {
      id: 5,
      name: "Metformin",
      dosage: "500mg",
      status: "supply",
      quantity: "30 pills",
      timeOfDay: "08:00",
      refillDate: "2026-02-15",
      additionalInfo: "Before Meal",
      taken: false,
      lastQuantityDelta: 0,
    },
    {
      id: 6,
      name: "Blood Pressure Meds",
      dosage: "1 pill",
      status: "supply",
      quantity: "60 pills",
      timeOfDay: "20:00",
      refillDate: "2026-03-10",
      additionalInfo: "Before Sleep",
      taken: false,
      lastQuantityDelta: 0,
    },
  ]);

  // Helper: Parse numeric quantity and unit from a quantity string like "30 pills"
  const parseQuantity = useCallback((quantityStr = "") => {
    const match = quantityStr.match(/^\s*(\d+)\s*(.*)\s*$/);
    const value = match ? parseInt(match[1], 10) || 0 : 0;
    const unit = match && match[2] ? match[2].trim() : "";
    return { value, unit };
  }, []);

  // Helper: Format quantity back to a display string
  const formatQuantity = useCallback((value, unit) => {
    return `${Math.max(value, 0)}${unit ? ` ${unit}` : ""}`;
  }, []);

  // Helper: Parse dosage to extract numeric value (e.g., "2 pills" -> 2, "500mg" -> 500)
  const parseDosage = useCallback((dosageStr = "") => {
    const match = dosageStr.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, []);

  // Handle marking a medication as taken
  const handleMarkAsTaken = useCallback(
    (medicationId) => {
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setMedications((prev) =>
        prev.map((med) =>
          med.id === medicationId
            ? (() => {
                const { value: quantityValue, unit: quantityUnit } =
                  parseQuantity(med.quantity);
                const dosageAmount = parseDosage(med.dosage);
                const shouldDecrement = med.status === "pending" || !med.taken; // decrement when moving from pending to taken
                const decrementAmount = shouldDecrement ? dosageAmount : 0;
                const updatedQuantity =
                  quantityValue > 0 ? quantityValue - decrementAmount : 0;
                return {
                  ...med,
                  status: "taken",
                  taken: true,
                  takenTime: currentTime,
                  quantity: formatQuantity(updatedQuantity, quantityUnit),
                  lastQuantityDelta: shouldDecrement ? -dosageAmount : 0,
                };
              })()
            : med
        )
      );
    },
    [parseQuantity, formatQuantity, parseDosage]
  );

  // Handle deleting a medication from taken section
  // Moves medication back to pending status instead of permanently deleting
  const handleDeleteMedication = useCallback(
    (medicationId) => {
      setMedications((prev) =>
        prev.map((med) =>
          med.id === medicationId
            ? (() => {
                const { value, unit } = parseQuantity(med.quantity);
                const shouldIncrement = med.lastQuantityDelta < 0; // restore if quantity was decremented
                const incrementAmount = shouldIncrement
                  ? Math.abs(med.lastQuantityDelta)
                  : 0;
                const restoredQuantity = value + incrementAmount;
                return {
                  ...med,
                  status: "pending",
                  taken: false,
                  takenTime: null,
                  quantity: formatQuantity(restoredQuantity, unit),
                  lastQuantityDelta: 0,
                };
              })()
            : med
        )
      );
    },
    [parseQuantity, formatQuantity]
  );

  const value = {
    medications,
    setMedications,
    parseQuantity,
    formatQuantity,
    parseDosage,
    handleMarkAsTaken,
    handleDeleteMedication,
  };

  return (
    <MedicationsContext.Provider value={value}>
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedications() {
  const context = useContext(MedicationsContext);
  if (!context) {
    throw new Error("useMedications must be used within a MedicationsProvider");
  }
  return context;
}
