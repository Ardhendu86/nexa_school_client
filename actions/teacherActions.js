const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getTeachers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/teachers`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    return [];
  }
}
