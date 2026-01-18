const API_URL = "/api";

// Helper function to format medication data for API
const formatMedicationForAPI = (medicationData) => {
  // Convert frontend frequency fields to single frequency string
  const formatFrequency = (data) => {
    if (data.frequencyType === "timesPerDay") {
      return `${data.frequencyValue} times per day`;
    } else if (data.frequencyType === "everyHours") {
      return `Every ${data.frequencyValue} hour${data.frequencyValue !== "1" ? "s" : ""}`;
    } else if (data.frequencyType === "custom") {
      return data.frequencyText;
    }
    return data.frequency || "";
  };

  return {
    name: medicationData.name,
    dosage: medicationData.dosage,
    type: medicationData.type || "pills",
    status: medicationData.status || "supply",
    timeOfDay: medicationData.timeOfDay || null,
    frequency: formatFrequency(medicationData),
    quantity: medicationData.quantity || "",
    refillDate: medicationData.refillDate || "",
    additionalInfo: medicationData.additionalInfo || "",
    pillColor: medicationData.pillColor || "",
    instructions: medicationData.instructions || [],
  };
};

const getHeaders = () => {
  const token = localStorage.getItem("token");
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // Medications
  medications: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/medications`, {
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
    getForPatient: async (patientId) => {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/medications`,
        {
          headers: getHeaders(),
        },
      );
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
