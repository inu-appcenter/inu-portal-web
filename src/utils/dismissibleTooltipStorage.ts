const DISMISSED_TOOLTIP_STORAGE_KEY = "dismissed-tooltip-ids";

function getSafeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readDismissedTooltipIds(storage: Storage) {
  const storedValue = storage.getItem(DISMISSED_TOOLTIP_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((tooltipId): tooltipId is string => {
    return typeof tooltipId === "string" && tooltipId.length > 0;
  });
}

export function isTooltipDismissed(tooltipId: string) {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return false;
  }

  try {
    return readDismissedTooltipIds(storage).includes(tooltipId);
  } catch (error) {
    console.error("Failed to read dismissed tooltip state", error);
    return false;
  }
}

export function dismissTooltip(tooltipId: string) {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    const dismissedTooltipIds = readDismissedTooltipIds(storage);

    if (dismissedTooltipIds.includes(tooltipId)) {
      return;
    }

    storage.setItem(
      DISMISSED_TOOLTIP_STORAGE_KEY,
      JSON.stringify([...dismissedTooltipIds, tooltipId]),
    );
  } catch (error) {
    console.error("Failed to save dismissed tooltip state", error);
  }
}

export { DISMISSED_TOOLTIP_STORAGE_KEY };
