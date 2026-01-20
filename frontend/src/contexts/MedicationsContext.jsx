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
import {
  getNowTimeInputRounded,
  toTimeInput,
  timeToMinutes,
  getStoredUser,
  isReadOnlyPatientUser,
  to12HourDisplay,
} from "../utils";

const MedicationsContext = createContext(null);

export function MedicationsProvider({ children }) {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useError();
  const isReadOnlyPatient = isReadOnlyPatientUser(getStoredUser());

  const loadMedications = useCallback(
    async (date = null) => {
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
    },
    [showError],
  );

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const formatQuantity = useCallback((value, unit) => {
    const num = Number(value);
    if (isNaN(num)) return `0${unit ? ` ${unit}` : ""}`;
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(num * 100) / 100;
    return `${rounded}${unit ? ` ${unit}` : ""}`;
  }, []);

  const parseQuantity = useCallback((val) => {
    if (typeof val === "number") return { value: val, unit: "" };
    const str = String(val || "");
    const match = str.match(/^\s*(\d+(\.\d+)?)\s*(.*)\s*$/);
    const value = match ? parseFloat(match[1]) || 0 : 0;
    const unit = match && match[3] ? match[3].trim() : "";
    return { value, unit };
  }, []);

  const parseDosage = useCallback((val) => {
    if (typeof val === "number") return val;
    const str = String(val || "");
    const match = str.match(/^(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 1;
  }, []);

  const createMedication = useCallback(
    async (medicationData) => {
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
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

  const markMedicationAsTaken = useCallback(
    (medicationOrId, takenTime = null, date = null, timeSlot = null) => {
      if (isReadOnlyPatient) {
        showError("Read-only access");
        return;
      }
      const medicationId =
        typeof medicationOrId === "object" && medicationOrId
          ? medicationOrId.id
          : medicationOrId;
      const scheduleSlots =
        typeof medicationOrId === "object" && medicationOrId
          ? Array.isArray(medicationOrId?.timesOfDay) &&
            medicationOrId.timesOfDay.length > 0
            ? medicationOrId.timesOfDay
            : medicationOrId?.timeOfDay
              ? [medicationOrId.timeOfDay]
              : []
          : [];
      const normalizedSlots = scheduleSlots
        .map((slot) => String(slot || "").trim())
        .filter(Boolean);
      const nowMinutes = timeToMinutes(getNowTimeInputRounded(15, "nearest"));
      const resolvedTimeSlot =
        timeSlot ||
        (normalizedSlots.length
          ? (() => {
              if (normalizedSlots.length === 1) return normalizedSlots[0];
              const sorted = normalizedSlots
                .map((slot) => ({
                  slot,
                  minutes: timeToMinutes(toTimeInput(slot) || slot),
                }))
                .sort((a, b) => a.minutes - b.minutes);
              const upcoming = sorted.find((s) => s.minutes >= nowMinutes);
              return (upcoming || sorted[sorted.length - 1]).slot;
            })()
          : null);

      const targetDate = date || new Date().toISOString().split("T")[0];
      const currentTime =
        takenTime || to12HourDisplay(getNowTimeInputRounded(15, "nearest"));

      if (normalizedSlots.length > 1) {
        api.medications
          .markAsTaken(medicationId, currentTime, targetDate, resolvedTimeSlot)
          .then(() => loadMedications(targetDate))
          .catch((error) => {
            showError(error.message || "Unable to update medication status");
            loadMedications(targetDate);
          });
        return;
      }

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
            const quantityValue =
              typeof med.quantity === "number"
                ? med.quantity
                : parseQuantity(med.quantity).value;
            const dosageAmount =
              typeof med.dosage === "number"
                ? med.dosage
                : parseDosage(med.dosage);
            const shouldDecrement = med.status !== "taken" && !med.taken;
            const decrementAmount = shouldDecrement ? dosageAmount : 0;
            const updatedQuantityValue =
              quantityValue > 0
                ? Math.max(quantityValue - decrementAmount, 0)
                : 0;

            updatedQuantity = updatedQuantityValue;
            lastQuantityDelta = shouldDecrement ? -dosageAmount : 0;

            if (!med.initialQuantity && shouldDecrement) {
              updatedInitialQuantity = quantityValue;
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

      api.medications
        .markAsTaken(medicationId, currentTime, targetDate, resolvedTimeSlot)
        .catch((error) => {
          showError(error.message || "Unable to update medication status");
          loadMedications(targetDate);
        });
    },
    [
      parseQuantity,
      formatQuantity,
      parseDosage,
      showError,
      loadMedications,
      isReadOnlyPatient,
    ],
  );

  const resetMedicationStatus = useCallback(
    async (medicationOrId, date = null, timeSlot = null) => {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const medicationId =
        typeof medicationOrId === "object" && medicationOrId
          ? medicationOrId.id
          : medicationOrId;
      const resolvedTimeSlot =
        timeSlot ||
        (typeof medicationOrId === "object" && medicationOrId
          ? medicationOrId.timeOfDay || medicationOrId.timesOfDay?.[0]
          : null);
      try {
        if (isReadOnlyPatient) {
          throw new Error("Read-only access");
        }
        setMedications((prev) =>
          prev.map((med) =>
            med.id === medicationId
              ? {
                  ...med,
                  status: "pending",
                  taken: false,
                  takenTime: null,
                }
              : med,
          ),
        );

        await api.medications.undoMarkAsTaken(
          medicationId,
          targetDate,
          resolvedTimeSlot,
        );
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
