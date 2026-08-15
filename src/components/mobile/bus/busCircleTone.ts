const GREEN_BUS_NUMBERS = new Set(["41", "42", "43", "46", "47", "순환41", "순환42", "순환43", "순환46", "순환47"]);
const RED_BUS_NUMBERS = new Set(["1301", "3002", "303-1", "6405", "M6405", "M6464", "6724", "6777"]);
const RED_SECTION_LABELS = new Set(["광역버스", "직행좌석"]);

export type BusCircleTone = "default" | "green" | "red";

export function getBusCircleTone(number: string): BusCircleTone {
  if (!number) return "default";

  if (number.startsWith("순환") || GREEN_BUS_NUMBERS.has(number)) {
    return "green";
  }

  if (number.startsWith("M") || RED_BUS_NUMBERS.has(number)) {
    return "red";
  }

  return "default";
}

export function isRedBusSectionLabel(label: string) {
  return RED_SECTION_LABELS.has(label);
}
