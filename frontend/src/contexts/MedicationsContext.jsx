/**
 * MedicationsContext - Global medications state management
 * Provides shared medication state across Dashboard and MedicationPage
 * Handles syncing quantity changes when medications are marked as taken/pending
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { api } from "../api";
import { useError } from "./ErrorContext";
import { normalizeMedication } from "../utils/normalization";
import { getStoredUser, isReadOnlyPatientUser } from "../utils";

const MedicationsContext = createContext(null);

export function MedicationsProvider({ children }) {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useError();
  const isReadOnlyPatient = isReadOnlyPatientUser(getStoredUser());

  const loadMedications = useCallback(async (date = null) => {
    setIsLoading(true);
    try {
      const meds = await api.medications.getAll(date);
      setMedications(
        (Array.isArray(meds) ? meds : []).map(normalizeMedication),
      );
    } catch (error) {
      showError(error.message || "Unable to load medications");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Helper: Parse numeric quantity and unit from a quantity string like "30 pills"
  const parseQuantity = useCallback((quantityStr = "") => {
    const str = String(quantityStr || "");
    const match = str.match(/^\s*(\d+)\s*(.*)\s*$/);
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
    const str = String(dosageStr || "");
    const match = str.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, []);

  const createMedication = useCallback(
    async (medicationData) => {
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
        // Ensure initialQuantity is set if not provided
        const dataWithInitialQuantity = {
          ...medicationData,
          initialQuantity:
            medicationData.initialQuantity ?? medicationData.quantity,
        };
        const created = await api.medications.create(dataWithInitialQuantity);
        const normalized = normalizeMedication(created);
        setMedications((prev) => [...prev, normalized].filter(Boolean));
        return normalized;
      } catch (error) {
        showError(error.message || "Unable to add medication");
        throw error;
      }
    },
    [showError, isReadOnlyPatient],
  );

  const updateMedication = useCallback(
    async (id, updates) => {
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
        const updated = await api.medications.update(id, updates);
        setMedications((prev) =>
          prev.map((med) =>
            med.id === id
              ? {
                  ...normalizeMedication(updated),
                  lastQuantityDelta: med.lastQuantityDelta || 0,
                }
              : med,
          ),
        );
        return updated;
      } catch (error) {
        showError(error.message || "Unable to update medication");
        throw error;
      }
    },
    [showError, isReadOnlyPatient],
  );

  const deleteMedication = useCallback(
    async (id) => {
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
        await api.medications.delete(id);
        setMedications((prev) => prev.filter((med) => med.id !== id));
      } catch (error) {
        showError(error.message || "Unable to delete medication");
        throw error;
      }
    },
    [showError, isReadOnlyPatient],
  );

  // Handle marking a medication as taken
  const markMedicationAsTaken = useCallback(
    (medicationId, date = null) => {
      if (isReadOnlyPatient) {
        showError("Read-only access");
        return;
      }
      const targetDate = date || new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      let updatedQuantity;
      let updatedInitialQuantity;
      let lastQuantityDelta = 0;

      setMedications((prev) =>
        prev.map((med) => {
          if (med.id !== medicationId) return med;
          const hasQuantity =
            med.quantity !== undefined &&
            med.quantity !== null &&
            med.quantity !== "";
          if (hasQuantity) {
            const { value: quantityValue, unit: quantityUnit } = parseQuantity(
              med.quantity,
            );
            const dosageAmount = parseDosage(med.dosage);
            const shouldDecrement = med.status !== "taken" && !med.taken;
            const decrementAmount = shouldDecrement ? dosageAmount : 0;
            const updatedQuantityValue =
              quantityValue > 0
                ? Math.max(quantityValue - decrementAmount, 0)
                : 0;
            updatedQuantity = formatQuantity(
              updatedQuantityValue,
              quantityUnit,
            );
            lastQuantityDelta = shouldDecrement ? -dosageAmount : 0;

            // Set initialQuantity on first time marking as taken if not already set
            if (!med.initialQuantity && shouldDecrement) {
              updatedInitialQuantity = med.quantity;
            }
          }
          return {
            ...med,
            status: "taken",
            taken: true,
            takenTime: currentTime,
            quantity: updatedQuantity ?? med.quantity,
            initialQuantity: updatedInitialQuantity ?? med.initialQuantity,
            lastQuantityDelta,
          };
        }),
      );

      api.medications.markAsTaken(medicationId, currentTime, targetDate).catch((error) => {
        showError(error.message || "Unable to update medication status");
        loadMedications(targetDate);
      });
    },
    [parseQuantity, formatQuantity, parseDosage, showError, loadMedications, isReadOnlyPatient],
  );

  // Reset medication status to "pending" - removes from taken cards and restores quantity
  const resetMedicationStatus = useCallback(
    async (id, date = null) => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
        // Optimistically update local state
        setMedications((prev) =>
          prev.map((med) =>
            med.id === id
              ? {
                  ...med,
                  status: "pending",
                  taken: false,
                  takenTime: null,
                  // Local quantity update is tricky because we don't know the exact increment here easily,
                  // but for immediate UI feedback we can try or just wait for loadMedications
                }
              : med,
          ),
        );

        // Update on server
        await api.medications.undoMarkAsTaken(id, targetDate);
        // Refresh to get accurate quantity from server
        await loadMedications(targetDate);
      } catch (error) {
        showError(error.message || "Unable to reset medication status");
        loadMedications(targetDate);
      }
    },
    [showError, loadMedications, isReadOnlyPatient],
  );

  const value = {
    medications,
    isLoading,
    isReadOnlyPatient,
    refreshMedications: loadMedications,
    parseQuantity,
    formatQuantity,
    parseDosage,
    createMedication,
    updateMedication,
    deleteMedication,
    markMedicationAsTaken,
    resetMedicationStatus,
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
