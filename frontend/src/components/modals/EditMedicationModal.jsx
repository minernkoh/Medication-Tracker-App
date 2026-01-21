/**
 * EditMedicationModal Component
 *
 * Time-focused modal:
 * - Taken entry: edit "Time Taken"
 * - Otherwise: edit "Schedule Time(s)" only
 */
import { useEffect, useState } from "react";
import { Modal, Button, TimePickerDropdown } from "../ui";
import {
  getNowTimeInputRounded,
  TIME_BUCKET_TO_24H,
  to12HourDisplay,
  toTimeInput,
  toLocalIsoDay,
} from "../../utils";

function EditMedicationModal({
  isOpen,
  onClose,
  onSave,
  medication = null,
  mode = "Personal",
}) {
  const [formData, setFormData] = useState({
    timeOfDay: [],
    takenDate: "",
    takenTime: "",
  });
  const [scheduleTimeInput, setScheduleTimeInput] = useState("");
  const [errors, setErrors] = useState({});

  const isTakenMode = medication?.status === "taken" || medication?.taken;

  useEffect(() => {
    if (!isOpen || !medication) return;

    const timesOfDay =
      Array.isArray(medication?.timesOfDay) && medication.timesOfDay.length > 0
        ? medication.timesOfDay
        : medication?.timeOfDay
          ? [medication.timeOfDay]
          : [];

    const normalizedTimesOfDay = (timesOfDay || [])
      .map((t) => {
        const raw = String(t || "").trim();
        if (!raw) return null;
        const lowered = raw.toLowerCase();
        if (TIME_BUCKET_TO_24H[lowered]) return TIME_BUCKET_TO_24H[lowered];
        return toTimeInput(raw) || null;
      })
      .filter(Boolean);

    setFormData({
      timeOfDay: normalizedTimesOfDay,
      takenDate: medication?.takenDate || toLocalIsoDay(new Date()),
      takenTime: toTimeInput(medication?.takenTime || ""),
    });
    setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
    setErrors({});
  }, [isOpen, medication]);

  const validate = () => {
    const nextErrors = {};
    if (isTakenMode) {
      if (!formData.takenTime) nextErrors.takenTime = "Field is required";
    } else if (
      !Array.isArray(formData.timeOfDay) ||
      formData.timeOfDay.length === 0
    ) {
      nextErrors.timeOfDay = "Add at least one time";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addScheduleTimeFromInput = (rawValue) => {
    const normalized = String(rawValue || "").trim();
    if (!/^\d{2}:\d{2}$/.test(normalized)) return;

    setFormData((prev) => {
      const next = Array.isArray(prev.timeOfDay) ? [...prev.timeOfDay] : [];
      if (!next.includes(normalized)) next.push(normalized);
      return { ...prev, timeOfDay: next };
    });
    setScheduleTimeInput(getNowTimeInputRounded(15, "nearest"));
    if (errors.timeOfDay) {
      setErrors((prev) => ({ ...prev, timeOfDay: "" }));
    }
  };

  const removeScheduleTime = (time) => {
    setFormData((prev) => ({
      ...prev,
      timeOfDay: (prev.timeOfDay || []).filter((t) => t !== time),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isTakenMode) {
      onSave({
        ...medication,
        // Ensure downstream handlers treat this as a taken-dose time edit.
        status: "taken",
        taken: true,
        takenDate:
          formData.takenDate ||
          medication?.takenDate ||
          toLocalIsoDay(new Date()),
        takenTime: formData.takenTime
          ? to12HourDisplay(formData.takenTime)
          : "",
      });
      return;
    }

    onSave({
      ...medication,
      timeOfDay: formData.timeOfDay?.[0] || null,
      timesOfDay: Array.isArray(formData.timeOfDay) ? formData.timeOfDay : [],
    });
  };

  if (!isOpen || !medication) return null;

  const submitVariant = mode === "Caregiver" ? "secondary" : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTakenMode ? "Edit Time Taken" : "Edit Schedule"}
      size="md"
      mode={mode}
      footerContent={
        <>
          <Button
            variant="modalSecondary"
            onClick={onClose}
            fullWidth
            mode={mode}
          >
            Cancel
          </Button>
          <Button
            variant={submitVariant}
            onClick={() => {
              document.getElementById("edit-medication-form")?.requestSubmit();
            }}
            fullWidth
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form id="edit-medication-form" onSubmit={handleSubmit} className="p-5">
        <div className="space-y-4">
          {isTakenMode ? (
            <div>
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Time Taken <span className="text-danger">*</span>
              </label>
              <TimePickerDropdown
                value={formData.takenTime}
                onChange={(time) => {
                  setFormData((prev) => ({ ...prev, takenTime: time }));
                  if (errors.takenTime) {
                    setErrors((prev) => ({ ...prev, takenTime: "" }));
                  }
                }}
                minuteStep={15}
                mode={mode}
              />
              {errors.takenTime ? (
                <p className="mt-1.5 font-poppins font-semibold text-xs text-danger flex items-center gap-1.5 animate-fade-in">
                  <span className="inline-block w-1 h-1 rounded-full bg-danger flex-shrink-0" />
                  {errors.takenTime}
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <label className="block font-poppins font-semibold text-sm text-text-primary mb-1.5">
                Schedule Time(s) <span className="text-danger">*</span>
              </label>
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-border-default bg-background-default">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full" aria-label="Schedule time">
                    <TimePickerDropdown
                      value={scheduleTimeInput}
                      onChange={(time) => setScheduleTimeInput(time)}
                      minuteStep={15}
                      mode={mode}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addScheduleTimeFromInput(scheduleTimeInput)}
                  >
                    Add
                  </Button>
                </div>

                {Array.isArray(formData.timeOfDay) &&
                formData.timeOfDay.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {[...formData.timeOfDay]
                      .slice()
                      .sort()
                      .map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-poppins font-semibold bg-background-hover text-text-primary border border-border-default"
                        >
                          {to12HourDisplay(t)}
                          <button
                            type="button"
                            onClick={() => removeScheduleTime(t)}
                            className="text-text-secondary hover:text-danger transition-colors"
                            aria-label={`Remove ${to12HourDisplay(t)}`}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>
                ) : null}
              </div>
              {errors.timeOfDay ? (
                <p className="mt-1.5 font-poppins font-semibold text-xs text-danger">
                  {errors.timeOfDay}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default EditMedicationModal;
