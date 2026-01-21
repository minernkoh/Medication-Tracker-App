/**
 * PatientsPage Component - List of all patients for caregiver
 * Allows adding, editing, and viewing patient details
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PillIcon,
  CalendarCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  XIcon,
} from "@phosphor-icons/react";
import { getModeHexColor } from "../../../utils/modeUtils";
import { formatDateNumeric } from "../../../utils";
import {
  getPatientAvatarColor,
  getPatientInitials,
} from "../../../utils/patientUtils";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { Button, DataTable, FormField } from "../../ui";
import { api } from "../../../api";
import { useError } from "../../../contexts/ErrorContext";
import { getStoredUser } from "../../../utils/storageUtils";

const normalizePatient = (patient, index) => {
  if (!patient) return null;
  const id = patient.id || patient._id;
  return {
    ...patient,
    id,
    avatarInitials: getPatientInitials(patient.name || ""),
    avatarColor: getPatientAvatarColor({ ...patient, id }, index),
  };
};

function PatientsPage() {
  const navigate = useNavigate();
  const modeHexColor = getModeHexColor("Caregiver");
  const caregiverEmail = String(getStoredUser()?.email || "")
    .trim()
    .toLowerCase();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    email: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    patientId: null,
    patientName: "",
  });
  const { showError } = useError();

  const loadPatients = useCallback(async () => {
    try {
      const data = await api.caregiver.getPatients();
      setPatients(
        (Array.isArray(data) ? data : []).map((patient, index) =>
          normalizePatient(patient, index),
        ),
      );
    } catch (error) {
      showError(error.message || "Unable to load patients");
    }
  }, [showError]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Filter patients based on search
  const filteredPatients = patients.filter((p) => {
    const name = p.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle add patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.email.trim()) return;

    const requestedEmail = newPatient.email.trim().toLowerCase();
    if (caregiverEmail && requestedEmail === caregiverEmail) {
      showError(
        "You cannot add a patient with the same email as your caregiver account.",
      );
      return;
    }

    try {
      const created = await api.caregiver.addPatient({
        email: newPatient.email.trim(),
      });
      const normalized = normalizePatient(created, patients.length);
      setPatients((prev) => [...prev, normalized].filter(Boolean));
      setNewPatient({ email: "" });
      setShowAddModal(false);
    } catch (error) {
      showError(error.message || "Unable to add patient");
    }
  };

  // Handle delete patient
  const handleDeletePatient = (id) => {
    const patient = patients.find((p) => p.id === id);
    setDeleteConfirm({
      isOpen: true,
      patientId: id,
      patientName: patient?.name || "this patient",
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.patientId) {
      try {
        await api.caregiver.deletePatient(deleteConfirm.patientId);
        setPatients((prev) =>
          prev.filter((p) => p.id !== deleteConfirm.patientId),
        );
      } catch (error) {
        showError(error.message || "Unable to remove patient");
      }
    }
    setDeleteConfirm({ isOpen: false, patientId: null, patientName: "" });
  };

  const patientColumns = [
    {
      key: "name",
      label: "Patient",
      sortValue: (row) => row?.name || "",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold"
            style={{ backgroundColor: row.avatarColor }}
          >
            {row.avatarInitials}
          </div>
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/patients/${row.id}`);
              }}
              className="font-poppins font-semibold text-text-primary hover:underline text-left"
              aria-label={`View ${value}'s profile`}
            >
              {value}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "medicationsTotal",
      label: "Medications",
      sortValue: (row) => Number(row?.medicationsTotal ?? 0),
      render: (value) => (
        <div className="flex items-center gap-2">
          <PillIcon size={16} weight="regular" className="text-icon-secondary" />
          <span className="font-poppins text-text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "adherenceRate",
      label: "Today's Adherence",
      sortValue: (row) => Number(row?.adherenceRate ?? 0),
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                value >= 90 ? "bg-success" : value >= 70 ? "bg-warning" : "bg-danger"
              }`}
              style={{
                width: `${value}%`,
              }}
            />
          </div>
          <span
            className={`font-poppins text-sm font-medium ${
              value >= 90 ? "text-success" : value >= 70 ? "text-warning" : "text-danger"
            }`}
          >
            {value}%
          </span>
        </div>
      ),
    },
    {
      key: "nextAppointment",
      label: "Next Appointment",
      sortValue: (row) =>
        row?.nextAppointment?.date ? new Date(row.nextAppointment.date) : null,
      render: (value) =>
        value?.date ? (
          <div className="flex items-center gap-2">
            <CalendarCheckIcon
              size={16}
              weight="regular"
              className="text-icon-secondary"
            />
            <span className="font-poppins text-sm text-text-primary">
              {formatDateNumeric(value.date) || value.date}
            </span>
          </div>
        ) : (
          <span className="font-poppins text-sm text-text-secondary italic">
            No upcoming
          </span>
        ),
    },
    {
      key: "alerts",
      label: "Supply Status",
      sortValue: (row) => Number(row?.alerts ?? 0),
      render: (value) =>
        value > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-poppins text-xs font-semibold">
            <WarningCircleIcon size={14} weight="fill" />
            {value}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-poppins text-xs font-semibold">
            <CheckCircleIcon size={14} weight="fill" />
            Good
          </span>
        ),
    },
  ];

  return (
    <div className="bg-background-default w-full p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary">
              My Patients
            </h1>
            <p className="font-poppins text-base text-text-secondary mt-2">
              Manage and monitor all your patients in one place
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            icon={<PlusIcon size={20} weight="bold" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Patient
          </Button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="w-full max-w-md">
            <FormField
              name="patientsSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              icon={
                <MagnifyingGlassIcon
                  size={18}
                  weight="regular"
                  className="text-icon-secondary"
                />
              }
              rightElement={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-lg hover:bg-background-hover transition-colors"
                    aria-label="Clear search"
                  >
                    <XIcon
                      size={16}
                      weight="bold"
                      className="text-icon-secondary"
                    />
                  </button>
                ) : null
              }
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search patients"
            />
          </div>
        </div>

        {/* Patients table */}
        <DataTable
          columns={patientColumns}
          data={filteredPatients}
          defaultSortConfig={{ key: "name", direction: "asc" }}
          onRowClick={(row) => navigate(`/patients/${row.id}`)}
          onDelete={(row) => handleDeletePatient(row.id)}
          emptyMessage={
            searchQuery
              ? "No patients found matching your search"
              : "No patients added yet"
          }
          emptyAction={
            searchQuery ? null : (
              <button
                onClick={() => setShowAddModal(true)}
                className="font-poppins font-semibold text-sm"
                style={{ color: modeHexColor }}
              >
                Add your first patient
              </button>
            )
          }
          EmptyIcon={UsersIcon}
          mode="Caregiver"
        />

        {/* Patient cards for mobile */}
        <div className="md:hidden mt-4 space-y-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="bg-background-default border border-border-default rounded-2xl p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-poppins font-bold"
                  style={{ backgroundColor: patient.avatarColor }}
                >
                  {patient.avatarInitials}
                </div>
                <div className="flex-1">
                  <p className="font-poppins font-semibold text-text-primary">
                    {patient.name}
                  </p>
                </div>
                {patient.alerts > 0 && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                    <WarningCircleIcon size={14} weight="fill" />
                    <span className="font-poppins text-xs font-semibold">
                      {patient.alerts}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-poppins text-text-secondary">
                  {patient.medicationsTotal}
                </span>
                <span
                  className={`font-poppins font-semibold ${
                    patient.adherenceRate >= 90
                      ? "text-success"
                      : patient.adherenceRate >= 70
                        ? "text-warning"
                        : "text-danger"
                  }`}
                >
                  {patient.adherenceRate}% today
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal header */}
            <div
              className="p-6 pb-4"
              style={{ backgroundColor: `${modeHexColor}10` }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                <XIcon size={20} weight="bold" className="text-icon-primary" />
              </button>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: modeHexColor }}
              >
                <UsersIcon
                  size={24}
                  weight="fill"
                  className="text-white"
                />
              </div>
              <h2 className="font-poppins font-bold text-xl text-text-primary">
                Add New Patient
              </h2>
              <p className="font-poppins text-sm text-text-secondary mt-1">
                Add a patient by their email address. They must have an existing
                account.
              </p>
            </div>

            {/* Modal form */}
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="font-poppins font-semibold text-sm text-text-primary">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon
                    size={20}
                    weight="regular"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-icon-secondary"
                  />
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, email: e.target.value })
                    }
                    placeholder="patient@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-default bg-white font-poppins text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="secondary" size="lg" fullWidth>
                Add Patient
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, patientId: null, patientName: "" })
        }
        onConfirm={confirmDelete}
        title="Remove Patient"
        message={`Are you sure you want to remove ${deleteConfirm.patientName}? This will remove all their medication and appointment data. This action cannot be undone.`}
        confirmText="Remove Patient"
        cancelText="Cancel"
        variant="danger"
        mode="Caregiver"
      />
    </div>
  );
}

export default PatientsPage;
