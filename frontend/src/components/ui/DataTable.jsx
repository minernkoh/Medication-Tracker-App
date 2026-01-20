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
import React, { useMemo, useState } from "react";
import { CaretUpIcon, CaretDownIcon, PillIcon } from "@phosphor-icons/react";
import { getModeClasses } from "../../utils/modeUtils";
import ActionButtons from "./ActionButtons";
import EmptyState from "./EmptyState";

function defaultGetRowKey(row, index) {
  return row?.id || row?._id || index;
}

function normalizeSortableValue(value) {
  if (value === null || value === undefined) {
    return { kind: "empty", value: null };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { kind: "number", value: value.getTime() };
  }

  if (Array.isArray(value)) {
    return { kind: "string", value: value.join(", ").toLowerCase() };
  }

  const type = typeof value;
  if (type === "number") {
    return { kind: "number", value: Number.isFinite(value) ? value : null };
  }

  if (type === "boolean") {
    return { kind: "number", value: value ? 1 : 0 };
  }

  const str = String(value).trim();
  if (!str) return { kind: "empty", value: null };

  // Numeric strings (including percentages like "75%") should sort numerically.
  const numericCandidate = str.replace(/,/g, "");
  const percentMatch = numericCandidate.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percentMatch) {
    const num = Number(percentMatch[1]);
    return { kind: "number", value: Number.isFinite(num) ? num : null };
  }
  if (/^-?\d+(\.\d+)?$/.test(numericCandidate)) {
    const num = Number(numericCandidate);
    return { kind: "number", value: Number.isFinite(num) ? num : null };
  }

  return { kind: "string", value: str.toLowerCase() };
}

function compareNormalized(a, b) {
  // Always push empty values to the bottom.
  if (a.kind === "empty" && b.kind === "empty") return 0;
  if (a.kind === "empty") return 1;
  if (b.kind === "empty") return -1;

  if (a.kind === "number" && b.kind === "number") {
    return (a.value ?? 0) - (b.value ?? 0);
  }

  const aStr = a.kind === "string" ? a.value : String(a.value ?? "");
  const bStr = b.kind === "string" ? b.value : String(b.value ?? "");
  return aStr.localeCompare(bStr);
}

function DataTable({
  columns = [],
  data = [],
  sortConfig,
  onSort,
  defaultSortConfig = { key: null, direction: "asc" },
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  emptySubMessage = "",
  emptyAction = null,
  EmptyIcon = PillIcon,
  mode = "Personal",
  variant = "default",
  showActions = true,
  containerClassName = "",
  rowClassName,
  onRowClick,
  getRowKey = defaultGetRowKey,
}) {
  const modeClasses = getModeClasses(mode);
  const [internalSortConfig, setInternalSortConfig] = useState(defaultSortConfig);
  const effectiveSortConfig = onSort
    ? sortConfig || defaultSortConfig
    : internalSortConfig;
  const canSort = true;

  // Handle sort column click
  const handleSort = (key) => {
    const direction =
      effectiveSortConfig.key === key && effectiveSortConfig.direction === "asc"
        ? "desc"
        : "asc";
    const next = { key, direction };
    if (onSort) onSort(next);
    else setInternalSortConfig(next);
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (effectiveSortConfig.key !== columnKey) {
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-40 transition-opacity">
          <CaretUpIcon size={12} weight="bold" />
        </span>
      );
    }
    return effectiveSortConfig.direction === "asc" ? (
      <CaretUpIcon
        size={12}
        weight="bold"
        className={`ml-1 ${modeClasses.text}`}
      />
    ) : (
      <CaretDownIcon
        size={12}
        weight="bold"
        className={`ml-1 ${modeClasses.text}`}
      />
    );
  };

  const sortedData = useMemo(() => {
    const { key, direction } = effectiveSortConfig || {};
    if (!key) return data;

    const column = columns.find((c) => c.key === key);
    const getValue =
      typeof column?.sortValue === "function"
        ? (row) => column.sortValue(row)
        : (row) => row?.[key];

    const multiplier = direction === "desc" ? -1 : 1;

    return [...data]
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const av = normalizeSortableValue(getValue(a.row));
        const bv = normalizeSortableValue(getValue(b.row));
        const cmp = compareNormalized(av, bv) * multiplier;
        if (cmp !== 0) return cmp;
        // Stable fallback
        return a.index - b.index;
      })
      .map((x) => x.row);
  }, [columns, data, effectiveSortConfig]);

  // Padding based on variant
  const cellPadding = variant === "compact" ? "px-4 py-3" : "px-5 py-4";
  const headerPadding = variant === "compact" ? "px-4 py-3" : "px-5 py-4";

  const getColumnAlign = (col) => {
    const align = String(col?.align || "left").toLowerCase();
    if (align === "center" || align === "right" || align === "left") return align;
    return "left";
  };

  const getAlignTextClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const getAlignJustifyClass = (align) => {
    if (align === "center") return "justify-center";
    if (align === "right") return "justify-end";
    return "justify-start";
  };

  return (
    <div
      className={`bg-background-default border border-border-default rounded-2xl overflow-hidden shadow-sm ${containerClassName}`}
    >
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-background-subtle">
                {columns.map((col) => {
                  const align = getColumnAlign(col);
                  const alignTextClass = getAlignTextClass(align);
                  const alignJustifyClass = getAlignJustifyClass(align);

                  return (
                    <th
                      key={col.key}
                      onClick={
                        col.sortable !== false
                          ? () => handleSort(col.key)
                          : undefined
                      }
                      className={`${headerPadding} ${alignTextClass} font-poppins font-semibold text-xs text-text-secondary uppercase tracking-wide ${
                        col.sortable !== false && canSort
                          ? "cursor-pointer hover:text-text-primary transition-colors group select-none"
                          : ""
                      }`}
                    >
                      <div className={`flex items-center ${alignJustifyClass}`}>
                        {col.label}
                        {col.sortable !== false && canSort && (
                          <SortIndicator columnKey={col.key} />
                        )}
                      </div>
                    </th>
                  );
                })}
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
              {sortedData.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-border-default transition-colors hover:bg-background-hover ${
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName || ""
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => {
                    const align = getColumnAlign(col);
                    const alignTextClass = getAlignTextClass(align);
                    return (
                      <td
                        key={col.key}
                        className={`${cellPadding} ${alignTextClass}`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    );
                  })}
                  {showActions && (
                    <td className={cellPadding}>
                      <div className="flex justify-end">
                        <ActionButtons
                          onEdit={onEdit ? () => onEdit(row) : undefined}
                          onDelete={onDelete ? () => onDelete(row) : undefined}
                          size="base"
                          mode={mode}
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
        <EmptyState
          icon={
            <EmptyIcon
              weight="regular"
              className="text-icon-secondary"
            />
          }
          title={emptyMessage}
          description={emptySubMessage}
          action={emptyAction}
          size="md"
        />
      )}
    </div>
  );
}

export default DataTable;
