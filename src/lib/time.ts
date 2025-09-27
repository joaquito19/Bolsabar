import { DateTime } from "luxon";
export function nowInTZ(timezone: string) { return DateTime.now().setZone(timezone); }
export function isWithinHappyHour(now: DateTime, rules: {daysOfWeek: string, startLocal: string, durationMin: number, active: boolean, discountPct?: number}[]) {
  for (const r of rules) {
    if (!r.active) continue;
    const days = r.daysOfWeek.split(",").map(s => s.trim().toUpperCase());
    const dow = now.toFormat("ccc").toUpperCase().slice(0,3);
    if (!days.includes(dow)) continue;
    const [hh, mm] = r.startLocal.split(":").map(Number);
    const start = now.set({ hour: hh, minute: mm, second: 0, millisecond: 0 });
    const end = start.plus({ minutes: r.durationMin });
    if (now >= start && now <= end) return true;
  }
  return false;
}
