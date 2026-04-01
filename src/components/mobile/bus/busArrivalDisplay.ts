import type { ArrivalInfo, DynamicArrivalStation } from "@/types/bus";

interface ArrivalStationTextOptions {
  compact?: boolean;
  now?: Date;
}

const SEOUL_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DYNAMIC_STATION_TEXT: Record<DynamicArrivalStation, (date: Date) => string> = {
  "weekday-morning-shuttle": (date) =>
    isWeekdayMorningShuttleOperating(date)
      ? "수시 운행 중"
      : "운행 시간 아님",
};

export function getArrivalStationText(
  arrivalInfo?: ArrivalInfo | null,
  options: ArrivalStationTextOptions = {},
) {
  if (!arrivalInfo) {
    return "";
  }

  if (typeof arrivalInfo.restCount === "number") {
    return options.compact
      ? `${arrivalInfo.restCount} 전`
      : `${arrivalInfo.restCount} 정류장 전`;
  }

  if (arrivalInfo.station) {
    return arrivalInfo.station;
  }

  if (arrivalInfo.dynamicStation) {
    return (
      DYNAMIC_STATION_TEXT[arrivalInfo.dynamicStation]?.(
        options.now ?? new Date(),
      ) ?? ""
    );
  }

  return "";
}

function isWeekdayMorningShuttleOperating(date: Date) {
  const dateParts = SEOUL_TIME_FORMATTER.formatToParts(date);
  const weekday = dateParts.find((part) => part.type === "weekday")?.value;
  const hour = Number(dateParts.find((part) => part.type === "hour")?.value);
  const minute = Number(
    dateParts.find((part) => part.type === "minute")?.value,
  );
  const isWeekday =
    weekday === "Mon" ||
    weekday === "Tue" ||
    weekday === "Wed" ||
    weekday === "Thu" ||
    weekday === "Fri";
  const currentMinutes = hour * 60 + minute;

  return (
    isWeekday &&
    currentMinutes >= 8 * 60 + 30 &&
    currentMinutes <= 10 * 60 + 30
  );
}
