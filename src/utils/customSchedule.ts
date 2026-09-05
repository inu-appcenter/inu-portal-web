import type { TimeTableCustomMeetingRequest } from "@/types/timetables";
import { DAY_BY_INDEX } from "@/utils/timetable";

export interface CustomScheduleTimeSlot {
  dayIndices: number[];
  startTime: string;
  endTime: string;
  location?: string;
}

export const toCustomScheduleMeetings = (
  slots: CustomScheduleTimeSlot[],
): TimeTableCustomMeetingRequest[] =>
  slots.flatMap((slot) => {
    const uniqueDayIndices = [...new Set(slot.dayIndices)]
      .filter((dayIndex) => Number.isInteger(dayIndex))
      .filter((dayIndex) => dayIndex >= 0 && dayIndex < DAY_BY_INDEX.length)
      .sort((a, b) => a - b);

    return uniqueDayIndices.map((dayIndex) => ({
      location: slot.location?.trim() || undefined,
      day: DAY_BY_INDEX[dayIndex],
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  });
