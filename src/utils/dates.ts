function normalizeDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }

  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(value);

  return new Date(hasTimezone ? value : value + 'Z');
}

export function formatDate(value: Date | string): string {
  const date = normalizeDate(value);

  return `${String(date.getDate()).padStart(2, '0')}.` +
    `${String(date.getMonth() + 1).padStart(2, '0')}.` +
    `${date.getFullYear()}`;
}

export function formatDateTime(value: Date | string): string {
  const date = normalizeDate(value);

  return `${formatDate(date)} ` +
    `${String(date.getHours()).padStart(2, '0')}:` +
    `${String(date.getMinutes()).padStart(2, '0')}`;
}
