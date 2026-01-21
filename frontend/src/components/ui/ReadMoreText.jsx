import { useMemo, useState } from "react";

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function ReadMoreText({
  text,
  maxChars = 80,
  className = "",
  buttonClassName = "",
  moreLabel = "Read more",
  lessLabel = "Show less",
  withTitle = false,
}) {
  const fullText = useMemo(() => normalizeText(text).trim(), [text]);
  const [expanded, setExpanded] = useState(false);

  if (!fullText) return null;

  const shouldTruncate = fullText.length > maxChars;
  const displayText =
    shouldTruncate && !expanded
      ? `${fullText.slice(0, maxChars).trimEnd()}…`
      : fullText;

  return (
    <div
      className={`whitespace-normal break-words ${className}`}
      title={withTitle ? fullText : undefined}
    >
      <span>{displayText}</span>
      {shouldTruncate && (
        <button
          type="button"
          className={`ml-2 inline-flex items-center text-xs font-poppins font-semibold underline underline-offset-2 text-text-secondary hover:text-text-primary transition-colors ${buttonClassName}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
