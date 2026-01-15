/**
 * DataTable Component - Reusable table with sorting and icon hover states
 *
 * @param {Array} columns - Column definitions { key, label, sortable?, render? }
 * @param {Array} data - Array of data objects
 * @param {Object} sortConfig - { key, direction } for current sort state
 * @param {function} onSort - Callback when column header is clicked for sorting
 * @param {function} onEdit - Callback when edit button is clicked (receives row data)
 * @param {function} onDelete - Callback when delete button is clicked (receives row data)
 * @param {string} emptyMessage - Message to display when no data
 * @param {string} emptyIcon - Icon component to display when no data
 * @param {string} mode - "Personal" or "Caregiver"
 * @param {string} variant - "default" | "compact"
 */
import React from "react";
import { CaretUpIcon, CaretDownIcon, PillIcon } from "@phosphor-icons/react";
import { getPrimaryColor } from "../../utils/colors";
import { ActionButtons } from "./buttons";

function DataTable({
  columns = [],
  data = [],
  sortConfig = { key: null, direction: "asc" },
  onSort,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  emptySubMessage = "",
  EmptyIcon = PillIcon,
  mode = "Personal",
  variant = "default",
  showActions = true,
  rowClassName,
}) {
  const primaryColor = getPrimaryColor(mode);

  // Handle sort column click
  const handleSort = (key) => {
    if (!onSort) return;
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    onSort({ key, direction });
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
          <CaretUpIcon size={12} weight="bold" />
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <CaretUpIcon
        size={12}
        weight="bold"
        className="ml-1"
        color={primaryColor}
      />
    ) : (
      <CaretDownIcon
        size={12}
        weight="bold"
        className="ml-1"
        color={primaryColor}
      />
    );
  };

  // Padding based on variant
  const cellPadding = variant === "compact" ? "px-4 py-3" : "px-5 py-4";
  const headerPadding = variant === "compact" ? "px-4 py-3" : "px-5 py-4";

  return (
    <div className="bg-background-default border border-border-default rounded-2xl overflow-hidden shadow-sm">
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-background-subtle">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                    className={`${headerPadding} text-left font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide ${
                      col.sortable !== false && onSort
                        ? "cursor-pointer hover:text-text-primary transition-colors group select-none"
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.sortable !== false && onSort && (
                        <SortIndicator columnKey={col.key} />
                      )}
                    </div>
                  </th>
                ))}
                {showActions && (
                  <th
                    className={`${headerPadding} text-right font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide`}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`border-b border-border-default transition-colors hover:bg-background-hover ${
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName || ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cellPadding}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className={cellPadding}>
                      <div className="flex justify-end">
                        <ActionButtons
                          onEdit={onEdit ? () => onEdit(row) : undefined}
                          onDelete={onDelete ? () => onDelete(row) : undefined}
                          size="base"
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <EmptyIcon size={32} weight="light" color={primaryColor} />
          </div>
          <p className="font-poppins font-medium text-text-primary">
            {emptyMessage}
          </p>
          {emptySubMessage && (
            <p className="font-poppins text-sm text-text-secondary mt-1 max-w-xs">
              {emptySubMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
