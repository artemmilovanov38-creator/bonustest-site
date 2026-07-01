import { getStatusText } from "../utils/status";

export default function StatusBadge({ status }) {
  return (
    <span className="statusBadge">
      {getStatusText(status || "pending")}
    </span>
  );
}