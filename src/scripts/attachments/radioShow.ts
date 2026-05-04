import { getNextRadioShowDate } from "../../utils/feature/get-next-radio-show-date.ts";

export function radioShow() {
  const currentDate = getNextRadioShowDate(Date.now()).toLocaleDateString();

  return `Next "Headz" on Radio-Z: ${currentDate}`;
}
