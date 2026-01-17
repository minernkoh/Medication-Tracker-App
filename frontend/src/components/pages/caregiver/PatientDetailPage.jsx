import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CaretLeftIcon,
  PillIcon,
  CalendarCheckIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { colors, getModeColors } from "../../../utils/colors";
import { api } from "../../../api";
import { MedicationSection, DataTable } from "../../ui";

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const modeColors = getModeColors("Caregiver");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const data = await api.caregiver.getPatient(id);
        setPatient(data);
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-text-secondary">
        Loading patient details...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-10 text-center text-text-secondary">
        Patient not found
      </div>
    );
  }

  // Format appointments for table
  const appointmentColumns = [
    { key: "title", label: "Title" },
    { key: "doctorName", label: "Doctor" },
    {
      key: "date",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    { key: "time", label: "Time" },
  ];

  return (
    <div className="bg-background-default w-full h-full p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <CaretLeftIcon size={20} />
          Back to Patients
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-poppins font-bold text-2xl"
            style={{ backgroundColor: patient.color || modeColors.DEFAULT }}
          >
            {patient.initials || "P"}
          </div>
          <div>
            <h1 className="font-poppins font-bold text-3xl text-text-primary">
              {patient.name}
            </h1>
            <p className="font-poppins text-text-secondary">
              {patient.relationship} • {patient.phone}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medications Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <PillIcon size={24} weight="fill" color={modeColors.DEFAULT} />
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Medications
              </h2>
            </div>

            {patient.medications && patient.medications.length > 0 ? (
              <div className="bg-white rounded-2xl border border-border-default overflow-hidden">
                <ul className="divide-y divide-border-subtle">
                  {patient.medications.map((med) => (
                    <li
                      key={med._id}
                      className="p-4 hover:bg-background-subtle transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-poppins font-semibold text-text-primary">
                            {med.name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            med.taken
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {med.taken ? "Taken" : "Pending"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-text-secondary italic">
                No medications recorded.
              </p>
            )}
          </div>

          {/* Appointments Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheckIcon
                size={24}
                weight="fill"
                color={modeColors.DEFAULT}
              />
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Upcoming Appointments
              </h2>
            </div>

            <DataTable
              columns={appointmentColumns}
              data={patient.appointments || []}
              emptyMessage="No appointments scheduled"
              mode="Caregiver"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
