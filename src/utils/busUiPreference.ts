import { ROUTES } from "@/constants/routes";

export type BusUiVersion = "new" | "legacy";
export type SwitchableBusInfoType = "go-school" | "go-home";

const BUS_UI_PREFERENCE_KEY = "bus-ui-version";
const BUS_UI_WELCOME_SEEN_KEY = "bus-ui-welcome-seen";

interface BuildBusUiRouteParams {
  type: string | null;
  category?: string | null;
  version: BusUiVersion;
}

function getSafeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function isSwitchableBusInfoType(
  type: string | null,
): type is SwitchableBusInfoType {
  return type === "go-school" || type === "go-home";
}

export function getStoredBusUiVersion(): BusUiVersion {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return "new";
  }

  try {
    return storage.getItem(BUS_UI_PREFERENCE_KEY) === "legacy"
      ? "legacy"
      : "new";
  } catch (error) {
    console.error("Failed to read bus UI preference", error);
    return "new";
  }
}

export function setStoredBusUiVersion(version: BusUiVersion) {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(BUS_UI_PREFERENCE_KEY, version);
  } catch (error) {
    console.error("Failed to save bus UI preference", error);
  }
}

export function hasSeenBusUiWelcomeModal() {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return true;
  }

  try {
    return storage.getItem(BUS_UI_WELCOME_SEEN_KEY) === "true";
  } catch (error) {
    console.error("Failed to read bus UI welcome modal state", error);
    return true;
  }
}

export function markBusUiWelcomeModalSeen() {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(BUS_UI_WELCOME_SEEN_KEY, "true");
  } catch (error) {
    console.error("Failed to save bus UI welcome modal state", error);
  }
}

export function buildBusUiRoute({
  type,
  category,
  version,
}: BuildBusUiRouteParams) {
  const pathname =
    version === "new" && isSwitchableBusInfoType(type)
      ? ROUTES.BUS.INFO_MAP
      : ROUTES.BUS.INFO;
  const searchParams = new URLSearchParams();

  if (type) {
    searchParams.set("type", type);
  }

  if (category) {
    searchParams.set("category", category);
  }

  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}

export function getPreferredBusUiRoute(
  type: string | null,
  category?: string | null,
) {
  return buildBusUiRoute({
    type,
    category,
    version: isSwitchableBusInfoType(type) ? getStoredBusUiVersion() : "legacy",
  });
}
