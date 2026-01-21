/**
 * API client (frontend)
 *
 * Single place to call the backend.
 * - Base URL is `/api` by default (Vite proxies this to the backend in dev).
 * - Automatically sends the JWT via `Authorization: Bearer <token>`.
 *
 * Key exports:
 * - `api.auth`, `api.medications`, `api.appointments`, `api.users`, `api.caregiver`
 */

import {
  getAuthData,
  getStoredToken,
  setAuthData,
  removeAuthData,
} from "./utils/storageUtils";
import { toLocalIsoDay } from "./utils/dateUtils";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const formatMedicationForAPI = (medicationData) => {
  if (!medicationData || typeof medicationData !== "object") return {};
  const formatFrequency = (data) => {
    if (data.frequencyType === "timesPerDay") {
      return `${data.frequencyValue} times per day`;
    } else if (data.frequencyType === "everyHours") {
      const value = String(data.frequencyValue);
      return `Every ${value} hour${value !== "1" ? "s" : ""}`;
    } else if (data.frequencyType === "custom") {
      return data.frequencyText;
    }
    return data.frequency;
  };
  const out = {};

  const passthroughKeys = [
    "name",
    "dosage",
    "unit",
    "type",
    "status",
    "timeOfDay",
    "quantity",
    "recommendSupply",
    "initialQuantity",
    "additionalInfo",
    "pillColor",
    "instructions",
    "takenTime",
  ];

  for (const key of passthroughKeys) {
    if (hasOwn(medicationData, key)) out[key] = medicationData[key];
  }

  if (
    hasOwn(medicationData, "timesOfDay") &&
    Array.isArray(medicationData.timesOfDay)
  ) {
    out.timesOfDay = medicationData.timesOfDay;
  }

  const frequency = formatFrequency(medicationData);
  if (frequency !== undefined) {
    out.frequency = frequency;
  }

  if (hasOwn(medicationData, "taken")) {
    out.taken = Boolean(medicationData.taken);
  }

  return out;
};

const getHeaders = () => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || response.statusText);
  }
  // Some endpoints might return 204 No Content
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Auth
  auth: {
    signup: async (userData) => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
    signin: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data.token) {
        const existing = getAuthData() || {};
        setAuthData({
          ...existing,
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        });
      }
      return data;
    },
    logout: () => {
      removeAuthData();
    },
  },

  // Medications
  medications: {
    getAll: async (date = null) => {
      const url = date
        ? `${API_URL}/medications?date=${date}`
        : `${API_URL}/medications`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/medications/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const formattedData = formatMedicationForAPI(data);
      const response = await fetch(`${API_URL}/medications`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formattedData),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const formattedData = formatMedicationForAPI(data);
      const response = await fetch(`${API_URL}/medications/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formattedData),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/medications/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getForPatient: async (patientId, date = null) => {
      const url = date
        ? `${API_URL}/patients/${patientId}/medications?date=${date}`
        : `${API_URL}/patients/${patientId}/medications`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    createForPatient: async (patientId, data) => {
      const formattedData = formatMedicationForAPI(data);
      const response = await fetch(
        `${API_URL}/patients/${patientId}/medications`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(formattedData),
        },
      );
      return handleResponse(response);
    },
    updateForPatient: async (patientId, id, data) => {
      const formattedData = formatMedicationForAPI(data);
      const response = await fetch(
        `${API_URL}/patients/${patientId}/medications/${id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(formattedData),
        },
      );
      return handleResponse(response);
    },
    deleteForPatient: async (patientId, id) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/medications/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      return handleResponse(response);
    },

    getByStatus: async (status, date = null) => {
      let url = `${API_URL}/medications?status=${status}`;
      if (date) url += `&date=${date}`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getForDate: async (date) => {
      // Use the generic getAll with date query param for consistency
      return api.medications.getAll(date);
    },

    markAsTaken: async (id, takenTime = null, date = null, timeSlot = null) => {
      const response = await fetch(`${API_URL}/medications/${id}/taken`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          status: "taken",
          date: date || toLocalIsoDay(new Date()),
          takenTime:
            takenTime ||
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          ...(timeSlot ? { timeSlot } : {}),
        }),
      });
      return handleResponse(response);
    },
    undoMarkAsTaken: async (id, date = null, timeSlot = null) => {
      const response = await fetch(`${API_URL}/medications/${id}/undo`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          date: date || toLocalIsoDay(new Date()),
          ...(timeSlot ? { timeSlot } : {}),
        }),
      });
      return handleResponse(response);
    },

    getSupply: async () => {
      const response = await fetch(`${API_URL}/medications/supply`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getDueToday: async () => {
      const response = await fetch(`${API_URL}/medications/today`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Appointments
  appointments: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getForPatient: async (patientId) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/appointments`,
        {
          headers: getHeaders(),
        },
      );
      return handleResponse(response);
    },
    createForPatient: async (patientId, data) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/appointments`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },
    updateForPatient: async (patientId, id, data) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/appointments/${id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },
    deleteForPatient: async (patientId, id) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/appointments/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      return handleResponse(response);
    },
  },

  // Users
  users: {
    getCurrent: async () => {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    update: async (userId, data) => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    changePassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${API_URL}/users/me/change-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse(response);
    },
    delete: async (userId) => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Caregiver
  caregiver: {
    getPatients: async () => {
      const response = await fetch(`${API_URL}/caregiver/patients`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getAppointments: async () => {
      const response = await fetch(`${API_URL}/caregiver/appointments`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getSchedule: async (date = null) => {
      const query = date ? `?date=${date}` : "";
      const response = await fetch(`${API_URL}/caregiver/schedule${query}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getPatient: async (id) => {
      const response = await fetch(`${API_URL}/caregiver/patients/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    addPatient: async (patientData) => {
      const response = await fetch(`${API_URL}/caregiver/patients`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(patientData),
      });
      return handleResponse(response);
    },
    deletePatient: async (patientId) => {
      const response = await fetch(
        `${API_URL}/caregiver/patients/${patientId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      return handleResponse(response);
    },
  },
};
