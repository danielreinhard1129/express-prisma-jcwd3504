import { reminderSchedule } from "./reminder";
import { reminder2Schedule } from "./reminder2";

export const initScheduler = () => {
  // add other schedulers here
  reminderSchedule();
  reminder2Schedule();
};
