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
}) {
  const sizeConfig = SIZES[size] || SIZES.base;
  const isUndo = deleteIconType === "undo";
  const DeleteIcon = isUndo ? ArrowCounterClockwise : TrashIcon;
  const hoverBgClass = isUndo ? "hover:bg-blue-50" : "hover:bg-danger-light";
  const ringColor = isUndo
    ? "focus-visible:ring-blue-500"
    : "focus-visible:ring-danger";
  const hoverIconColor = isUndo
    ? "group-hover/delete:text-blue-600"
    : "group-hover/delete:text-danger";

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
          className={`${sizeConfig.padding} rounded-lg hover:bg-primary-light transition-colors group/edit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
          aria-label={editLabel}
        >
          <PencilSimpleIcon
            size={sizeConfig.icon}
            weight="regular"
            className="text-icon-primary group-hover/edit:text-primary transition-colors"
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
          className={`${sizeConfig.padding} rounded-lg ${hoverBgClass} transition-colors group/delete focus:outline-none focus-visible:ring-2 ${ringColor} focus-visible:ring-offset-2`}
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
