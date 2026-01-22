/**
 * TodayAdherencePieChart
 * Shared "today's adherence" donut chart styling used across dashboards/profile pages.
 *
 * This intentionally mirrors the caregiver dashboard's version to keep the UI consistent.
 */
import PieChart from "./PieChart";

function TodayAdherencePieChart({
  taken = 0,
  notTaken = 0,
  size = 160,
  ...rest
}) {
  return (
    <PieChart
      taken={taken}
      notTaken={notTaken}
      size={size}
      label="Adherence"
      showLabel={false}
      {...rest}
    />
  );
}

export default TodayAdherencePieChart;

