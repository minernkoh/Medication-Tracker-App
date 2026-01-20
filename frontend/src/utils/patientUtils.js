import { colors } from "../theme/tokens";

// Patient color palette using design tokens
const PATIENT_COLORS = [
  colors.patient.pink,
  colors.patient.blue,
  colors.patient.green,
  colors.patient.amber,
  colors.patient.purple,
];

export function getPatientInitials(name = "") {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function normalizeSeedValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  // Support Mongo Extended JSON: { $oid: "..." }
  if (typeof value === "object" && typeof value.$oid === "string") {
    return value.$oid;
  }

  // Support BSON ObjectId-like: { toHexString() }
  if (typeof value === "object" && typeof value.toHexString === "function") {
    try {
      const hex = value.toHexString();
      if (typeof hex === "string") return hex;
    } catch {
      // fall through
    }
  }

  // Prefer custom toString if present
  if (typeof value?.toString === "function") {
    try {
      const str = value.toString();
      if (typeof str === "string" && str !== "[object Object]") return str;
    } catch {
      // fall through
    }
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// FNV-1a 32-bit hash for better distribution than simple charCode sums.
function fnv1a32(str) {
  let hash = 0x811c9dc5; // 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash *= 16777619 (with 32-bit overflow)
    hash =
      (hash +
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24)) >>>
      0;
  }
  return hash >>> 0;
}

/**
 * Deterministically pick a patient avatar background color.
 * Uses stable identifiers first (id/_id/email/name). Falls back to `fallbackIndex`.
 */
export function getPatientAvatarColor(patient, fallbackIndex) {
  const candidates = [
    patient?.id,
    patient?._id,
    patient?.email,
    patient?.name,
    fallbackIndex,
  ];

  const normalizedCandidates = candidates
    .map(normalizeSeedValue)
    .map((s) => String(s).trim())
    .filter(Boolean)
    // Guard against common "bad" seeds that collapse to a single color.
    .filter((s) => s !== "undefined" && s !== "[object Object]");

  const seed =
    normalizedCandidates[0] ??
    // Last-resort: still return *a* color even if the object is malformed.
    String(fallbackIndex ?? "");
  const hash = fnv1a32(seed);
  return PATIENT_COLORS[hash % PATIENT_COLORS.length] || colors.patient.blue;
}
