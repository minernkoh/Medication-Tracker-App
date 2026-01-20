/**
 * PieChart Component - Displays a donut chart with customizable data
 *
 * @param {number} taken - Number of medications taken
 * @param {number} notTaken - Number of medications not taken
 * @param {number} size - Size of the chart (default: 120)
 */

import { colors } from "../../../tailwind.config.js";

// Color constants using design tokens
const COLORS = {
  borderSubtle: colors.border.subtle,
  backgroundSubtle: colors.background.subtle,
  backgroundDefault: colors.background.default,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  success: colors.success.DEFAULT,
};

function PieChart({
  taken = 0,
  notTaken = 0,
  size = 120,
  label = "Complete",
  showLabel = true,
}) {
  const total = taken + notTaken;
  const takenPercentage = total > 0 ? (taken / total) * 100 : 0;
  const notTakenPercentage = total > 0 ? (notTaken / total) * 100 : 0;
  const normalizedLabel = typeof label === "string" ? label.trim() : "";
  const shouldShowLabel = Boolean(showLabel && normalizedLabel);

  // Calculate angles for the donut chart
  const takenAngle = (takenPercentage / 100) * 360;
  const notTakenAngle = (notTakenPercentage / 100) * 360;

  const outerRadius = size / 2 - 4; // Outer radius (leave some padding)
  const innerRadius = outerRadius * 0.6; // Inner radius (60% of outer for donut hole)
  const centerX = size / 2;
  const centerY = size / 2;

  // Helper function to create donut arc path
  const createDonutArc = (startAngle, endAngle) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    // Outer arc points
    const outerX1 = centerX + outerRadius * Math.cos(startAngleRad);
    const outerY1 = centerY + outerRadius * Math.sin(startAngleRad);
    const outerX2 = centerX + outerRadius * Math.cos(endAngleRad);
    const outerY2 = centerY + outerRadius * Math.sin(endAngleRad);

    // Inner arc points
    const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
    const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
    const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
    const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);

    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;

    // Create the donut segment path
    return `M ${outerX1} ${outerY1} 
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}
            L ${innerX2} ${innerY2}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
            Z`;
  };

  // Create SVG path for taken medications (green/success color)
  const getTakenPath = () => {
    if (taken === 0) return "";
    if (takenPercentage === 100) {
      // Full donut circle - outer circle clockwise, inner circle counter-clockwise
      const outerPath = `M ${centerX} ${
        centerY - outerRadius
      } A ${outerRadius} ${outerRadius} 0 1 1 ${centerX} ${
        centerY + outerRadius
      } A ${outerRadius} ${outerRadius} 0 1 1 ${centerX} ${
        centerY - outerRadius
      }`;
      const innerPath = `M ${centerX} ${
        centerY - innerRadius
      } A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${
        centerY + innerRadius
      } A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${
        centerY - innerRadius
      }`;
      return `${outerPath} ${innerPath} Z`;
    }

    const startAngle = -90; // Start from top
    const endAngle = startAngle + takenAngle;

    return createDonutArc(startAngle, endAngle);
  };

  // Create SVG path for not taken medications (gray/neutral color)
  const getNotTakenPath = () => {
    if (notTaken === 0) return "";
    if (notTakenPercentage === 100) {
      // Full donut circle - outer circle clockwise, inner circle counter-clockwise
      const outerPath = `M ${centerX} ${
        centerY - outerRadius
      } A ${outerRadius} ${outerRadius} 0 1 1 ${centerX} ${
        centerY + outerRadius
      } A ${outerRadius} ${outerRadius} 0 1 1 ${centerX} ${
        centerY - outerRadius
      }`;
      const innerPath = `M ${centerX} ${
        centerY - innerRadius
      } A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${
        centerY + innerRadius
      } A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${
        centerY - innerRadius
      }`;
      return `${outerPath} ${innerPath} Z`;
    }

    const startAngle = -90 + takenAngle; // Start where taken ends
    const endAngle = startAngle + notTakenAngle;

    return createDonutArc(startAngle, endAngle);
  };

  // If no medications, show empty state
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="none"
            stroke={COLORS.borderSubtle}
            strokeWidth="2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="none"
            stroke={COLORS.borderSubtle}
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY + 5}
            textAnchor="middle"
            className="font-poppins text-xs"
            fill={COLORS.textSecondary}
          >
            No data
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background donut */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill={COLORS.backgroundSubtle}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill={COLORS.backgroundDefault}
        />

        {/* Not taken segment (gray) - render first so taken appears on top */}
        {notTaken > 0 && (
          <path
            d={getNotTakenPath()}
            fill={COLORS.borderSubtle}
            fillRule={notTakenPercentage === 100 ? "evenodd" : undefined}
          />
        )}

        {/* Taken segment (green/success) - render last so it appears on top */}
        {taken > 0 && (
          <path
            d={getTakenPath()}
            fill={COLORS.success}
            fillRule={takenPercentage === 100 ? "evenodd" : undefined}
          />
        )}

        {/* Center text showing percentage */}
        <text
          x={centerX}
          y={shouldShowLabel ? centerY - 5 : centerY + 5}
          textAnchor="middle"
          className="font-poppins font-bold text-lg"
          fill={COLORS.textPrimary}
        >
          {Math.round(takenPercentage)}%
        </text>
        {shouldShowLabel && (
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="font-poppins text-xs"
            fill={COLORS.textSecondary}
          >
            {normalizedLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

export default PieChart;
