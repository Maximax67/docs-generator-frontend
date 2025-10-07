export function formatDate(date: Date, applyUtcOffset = true) {
  const localDate = applyUtcOffset
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    : date;

  const day = String(localDate.getDate()).padStart(2, '0');
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const year = localDate.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDateTime(date: Date, applyUtcOffset = true) {
  const localDate = applyUtcOffset
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    : date;

  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');

  return `${formatDate(localDate, false)} ${hours}:${minutes}`;
}
