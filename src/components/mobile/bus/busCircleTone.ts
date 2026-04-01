const GREEN_BUS_NUMBERS = new Set(["41", "46"]);
const RED_BUS_NUMBERS = new Set(["1301", "3002"]);
const RED_SECTION_LABELS = new Set(["광역버스"]);

export type BusCircleTone = "default" | "green" | "red";

export function getBusCircleTone(number: string): BusCircleTone {
  if (GREEN_BUS_NUMBERS.has(number)) {
    return "green";
  }

  if (RED_BUS_NUMBERS.has(number)) {
    return "red";
  }

  return "default";
}

export function isRedBusSectionLabel(label: string) {
  return RED_SECTION_LABELS.has(label);
}
