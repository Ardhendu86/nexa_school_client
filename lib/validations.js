export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}
