/**
 * GradientBackground Component - Decorative gradient background for pages
 *
 * @param {number} opacity - Opacity of the gradient (default: 0.1)
 * @param {string} className - Additional CSS classes
 */
import { getGradientBackground } from "../../utils";

function GradientBackground({ opacity = 0.1, className = "" }) {
  return (
    <div
      className={`hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
    >
      <div className="absolute h-[85.6875rem] left-[4.3125rem] top-[-11rem] w-[88.3125rem]">
        <div className="absolute inset-[-36.47%_-35.39%]">
          <div
            className="w-full h-full opacity-10"
            style={{
              background: getGradientBackground(opacity),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default GradientBackground;
