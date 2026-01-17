import React, { useState, useEffect } from "react";
import { CalendarCheckIcon, UserIcon } from "@phosphor-icons/react";
import { colors, getModeColors } from "../../../utils/colors";
import { api } from "../../../api";
import { DataTable } from "../../ui";

const CaregiverAppointmentsPage = () => {
  const modeColors = getModeColors("Caregiver");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.caregiver.getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch caregiver appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Columns for the data table
  const columns = [
    {
      key: "patient",
      label: "Patient",
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: patient?.color || modeColors.DEFAULT }}
          >
            {patient?.initials || <UserIcon />}
          </div>
          <span className="font-poppins font-medium text-text-primary">
            {patient?.nickname || patient?.name || "Unknown"}
          </span>
        </div>
      ),
    },
    { key: "title", label: "Appointment" },
    { key: "doctorName", label: "Doctor" },
    {
      key: "date",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "time",
      label: "Time",
      render: (val) => {
        if (!val) return "N/A";
        // Simple time formatting
        const [h, m] = val.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
      },
    },
    { key: "location", label: "Location" },
  ];

  return (
    <div className="bg-background-default w-full h-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <CalendarCheckIcon
            size={32}
            weight="fill"
            color={modeColors.DEFAULT}
          />
          <div>
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
              Caregiver Schedule
            </h1>
            <p className="font-poppins text-text-secondary">
              Consolidated view of all patient appointments
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-secondary">
            Loading schedule...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-sm">
              <DataTable
                columns={columns}
                data={appointments}
                emptyMessage="No upcoming appointments"
                emptySubMessage="Appointments added for your patients will appear here"
                mode="Caregiver"
                showActions={false} // Read-only view for consolidated list
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverAppointmentsPage;
