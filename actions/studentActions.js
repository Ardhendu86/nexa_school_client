const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getStudents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/students`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    return [];
  }
}

export async function createStudent(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to create student' };
  }
}
