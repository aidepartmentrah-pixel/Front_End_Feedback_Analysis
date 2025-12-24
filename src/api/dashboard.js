// frontend/src/api/dashboard.js
export async function fetchDashboardHierarchy() {
  const res = await fetch("/api/dashboard/hierarchy");
  if (!res.ok) throw new Error("Failed to load hierarchy");
  return res.json();
}
