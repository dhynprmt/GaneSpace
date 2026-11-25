const WITA_TZ = "Asia/Makassar";

export function formatDateWITA(isoString) {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WITA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

export function formatTimeWITA(isoString) {
  if (!isoString) return "-";
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: WITA_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(isoString)) + " WITA"
  );
}

export function formatDateTimeWITA(isoString) {
  if (!isoString) return "-";
  return `${formatDateWITA(isoString)} • ${formatTimeWITA(isoString)}`;
}