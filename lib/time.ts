export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);

  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;

  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} sem`;

  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? 'es' : ''}`;
}
