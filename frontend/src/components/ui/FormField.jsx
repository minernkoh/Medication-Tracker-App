/**
 * FormField Component - Reusable form field with label, input, and error message
 * Provides consistent form styling and validation display
 *
 * @param {string} label - Field label
 * @param {string} name - Input name attribute
 * @param {string} type - Input type (default: "text")
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {string} placeholder - Input placeholder
 * @param {React.ReactNode} icon - Optional icon to display before input
 * @param {React.ReactNode} rightElement - Optional element to display after input (e.g., toggle button)
 * @param {string} className - Additional CSS classes
 * @param {object} inputProps - Additional props to pass to input element
 */
import SelectMenu from "./SelectMenu";

function FormField({
  label,
  name,
  as = "input",
  type = "text",
  value,
  onChange,
  error,
  required = false,
  mode = "Personal",
  placeholder,
  icon,
  rightElement,
  className = "",
  options,
  ...inputProps
}) {
  const isReadOnly = Boolean(inputProps?.readOnly || inputProps?.disabled);

  // Base input classes
  const inputBaseClass =
    "w-full px-4 py-3 rounded-xl border font-poppins text-sm focus:outline-none transition-colors";
  const inputNormalClass = `${inputBaseClass} text-text-primary bg-background-default border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20`;
  const inputReadOnlyClass = `${inputBaseClass} text-text-secondary bg-background-subtle border-border-default focus:border-border-default focus:ring-0 cursor-not-allowed`;
  const inputErrorClass = `${inputBaseClass} text-text-primary bg-background-default border-danger focus:border-danger focus:ring-2 focus:ring-danger/20`;

  const inputClass = `${error ? inputErrorClass : isReadOnly ? inputReadOnlyClass : inputNormalClass} ${icon ? "pl-10" : ""} ${rightElement ? "pr-10" : ""}`.trim();

  const selectButtonClass = `${inputBaseClass} ${
    error
      ? "text-text-primary bg-background-default border-danger focus-visible:ring-danger/20"
      : isReadOnly
        ? "text-text-secondary bg-background-subtle border-border-default"
        : "text-text-primary bg-background-default border-border-default"
  } ${icon ? "pl-10" : ""} ${rightElement ? "pr-10" : ""}`.trim();

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block font-poppins font-semibold text-sm text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-secondary pointer-events-none">
            {icon}
          </div>
        )}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
        {as === "select" ? (
          <SelectMenu
            id={name}
            name={name}
            value={value || ""}
            onChange={(nextValue) => {
              // Preserve native <select> onChange signature expected by callers
              onChange?.({ target: { name, value: nextValue } });
            }}
            options={options}
            placeholder={placeholder}
            required={required}
            disabled={Boolean(inputProps?.disabled || inputProps?.readOnly)}
            mode={mode}
            aria-label={label || name}
            ariaInvalid={!!error}
            ariaDescribedBy={error ? `${name}-error` : undefined}
            buttonClassName={selectButtonClass}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            {...inputProps}
          />
        )}
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 font-poppins font-semibold text-xs text-danger flex items-center gap-1.5 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-danger flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
