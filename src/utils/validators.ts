export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function validatePassword(value: string): boolean {
  return value.length >= 8 && value.length <= 32;
}

export function validateName(value: string): boolean {
  if (value.length < 1 || value.length > 32) return false;

  const nameRegex = /^[\p{L}]+(?:[’'\- ]\p{L}+)*$/u;
  return nameRegex.test(value);
}
