export const firestoreToDate = (
  ts: { _seconds: number } | null
): string => {
  if (!ts) return '—';
  return new Date(ts._seconds * 1000).toLocaleDateString();
};