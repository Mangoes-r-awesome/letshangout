// Human-friendly time-from-now metadata for hangout dates.
// "Tonight" / "Tomorrow" / "This Friday" / "Next week" / "In 12 days" / "2 days ago"
//
// Computed against local midnight boundaries so a 6pm event today is still "Tonight"
// at 5pm — not "0 days from now" which is technically true but reads weird.

export type RelativeMeta = {
  line: string;
  dateNumeral: string;
  month: string;
  weekday: string;
  time: string;
  fullDate: string;
  isSoon: boolean;
};

export function relativeMeta(startsAt: string | null): RelativeMeta | null {
  if (!startsAt) return null;
  const start = new Date(startsAt);
  if (isNaN(start.getTime())) return null;

  const now = new Date();
  const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((startMid.getTime() - nowMid.getTime()) / 86400000);

  let line: string;
  if (days < 0) line = `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`;
  else if (days === 0) line = "Tonight";
  else if (days === 1) line = "Tomorrow";
  else if (days <= 6) line = `This ${start.toLocaleDateString("en-AU", { weekday: "long" })}`;
  else if (days <= 13) line = "Next week";
  else line = `In ${days} days`;

  return {
    line,
    dateNumeral: String(start.getDate()),
    month: start.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
    weekday: start.toLocaleDateString("en-AU", { weekday: "short" }).toUpperCase(),
    time: start.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", ""),
    fullDate: start.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }),
    isSoon: days >= 0 && days <= 1,
  };
}
