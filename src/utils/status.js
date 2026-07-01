export function getStatusText(status) {
  if (status === "pending") return "🟡 На проверке";
  if (status === "approved") return "🟢 Одобрено";
  if (status === "rejected") return "🔴 Отклонено";
  return "⚪ Неизвестно";
}