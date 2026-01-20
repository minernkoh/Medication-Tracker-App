/**
 * ActionButtons Component - Reusable edit/delete action buttons
 *
 * Provides consistent styling for edit and delete actions across the app.
 * Used in DataTable, PendingMedicine, and other components with row actions.
 *
 * @param {function} onEdit - Callback when edit button is clicked
 * @param {function} onDelete - Callback when delete button is clicked
 * @param {string} size - "sm" | "base" | "lg" - Icon size variant
 * @param {string} editLabel - Accessible label for edit button
 * @param {string} deleteLabel - Accessible label for delete button
 * @param {string} deleteIconType - "delete" or "undo" (default: "delete")
 * @param {boolean} showEdit - Whether to show edit button (default: true)
 * @param {boolean} showDelete - Whether to show delete button (default: true)
 */
import React from "react";
import {
  PencilSimpleIcon,
  TrashIcon,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

const SIZES = {
  sm: { icon: 16, padding: "p-1.5" },
  base: { icon: 18, padding: "p-2" },
  lg: { icon: 20, padding: "p-2.5" },
};

function ActionButtons({
  onEdit,
  onDelete,
  size = "base",
  editLabel = "Edit",
  deleteLabel = "Delete",
  deleteIconType = "delete",
  showEdit = true,
  showDelete = true,
  mode = "Personal",
}) {
  const sizeConfig = SIZES[size] || SIZES.base;
  const isUndo = deleteIconType === "undo";
  const DeleteIcon = isUndo ? ArrowCounterClockwise : TrashIcon;
  const isCaregiver = mode === "Caregiver";

  const focusRingWidth = size === "sm" ? "focus-visible:ring-1" : "focus-visible:ring-2";
  const focusRingOffset =
    size === "sm" ? "focus-visible:ring-offset-1" : "focus-visible:ring-offset-2";

  // "Undo" actions should follow the current mode color (not hardcoded blue)
  const modeHoverBgLight = isCaregiver ? "hover:bg-secondary-light" : "hover:bg-primary-light";
  const modeRingColor = isCaregiver
    ? "focus-visible:ring-secondary/35"
    : "focus-visible:ring-primary/35";
  const modeHoverIconColor = isCaregiver
    ? "group-hover/delete:text-secondary"
    : "group-hover/delete:text-primary";

  const hoverBgClass = isUndo ? modeHoverBgLight : "hover:bg-danger-light";
  const ringColor = isUndo ? modeRingColor : "focus-visible:ring-danger";
  const hoverIconColor = isUndo ? modeHoverIconColor : "group-hover/delete:text-danger";

  // Edit actions should be consistently "info/primary" (blue) across modes.
  const editHoverBg = "hover:bg-primary-light";
  const editRingColor = "focus-visible:ring-primary/35";
  const editHoverIconColor = "group-hover/edit:text-primary";

  if (!showEdit && !showDelete) return null;

  return (
    <div className="flex items-center gap-1">
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={`${sizeConfig.padding} rounded-lg ${editHoverBg} transition-colors group/edit focus:outline-none ${focusRingWidth} ${editRingColor} ${focusRingOffset}`}
          aria-label={editLabel}
        >
          <PencilSimpleIcon
            size={sizeConfig.icon}
            weight="regular"
            className={`text-icon-primary ${editHoverIconColor} transition-colors`}
          />
        </button>
      )}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`${sizeConfig.padding} rounded-lg ${hoverBgClass} transition-colors group/delete focus:outline-none ${focusRingWidth} ${ringColor} ${focusRingOffset}`}
          aria-label={deleteLabel}
        >
          <DeleteIcon
            size={sizeConfig.icon}
            weight="regular"
            className={`text-icon-primary ${hoverIconColor} transition-colors`}
          />
        </button>
      )}
    </div>
  );
}

export default ActionButtons;
