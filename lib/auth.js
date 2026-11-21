// Authentication session helper (reads genuine user from localStorage)

export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse current user from storage:', e);
    }
  }
  return null;
}
