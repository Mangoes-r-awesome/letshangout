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

// Days until the NEXT occurrence of the given birthday (rolls year over).
// Input format: ISO date "YYYY-MM-DD". Returns days >= 0 (0 = today).
export function daysUntilBirthday(birthday: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(todayMid.getFullYear(), month - 1, day);
  if (next < todayMid) next = new Date(todayMid.getFullYear() + 1, month - 1, day);
  return Math.round((next.getTime() - todayMid.getTime()) / 86400000);
}

// Compute age the person will be on their NEXT birthday.
export function ageOnNextBirthday(birthday: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
  if (!m) return null;
  const birthYear = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextThisYear = new Date(todayMid.getFullYear(), month - 1, day);
  const nextYear = nextThisYear < todayMid ? todayMid.getFullYear() + 1 : todayMid.getFullYear();
  return nextYear - birthYear;
}

export function birthdayLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  if (days <= 14) return "Next week";
  return `In ${days} days`;
}

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
