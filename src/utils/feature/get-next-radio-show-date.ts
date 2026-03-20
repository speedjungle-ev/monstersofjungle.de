export function getNextRadioShowDate(dateNow: number): Date {
  const currentDate = new Date(dateNow);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const weekday = firstDay.getDay(); // 0=Sun ... 6=Sat

  const daysToFirstSaturday = (6 - weekday + 7) % 7;
  const firstSaturdayDate = 1 + daysToFirstSaturday;

  const fourthSaturday = new Date(year, month, firstSaturdayDate + 21);
  fourthSaturday.setHours(22, 0, 0, 0);

  // If it's already passed, get next month's 4th Saturday
  if (fourthSaturday.getTime() < currentDate.getTime()) {
    const nextDate = new Date(year, month + 1, 1);
    return getNextRadioShowDate(nextDate.getTime());
  }

  return fourthSaturday;
}
