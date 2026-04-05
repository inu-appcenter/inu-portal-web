import { ROUTES } from "@/constants/routes";
import { CollegeOfficeContact, DirectoryEntry } from "@/types/directory";

export type PhonebookDetailKind = "person" | "office";

export interface PersonPhonebookDetailState {
  kind: "person";
  entry: DirectoryEntry;
}

export interface OfficePhonebookDetailState {
  kind: "office";
  entry: CollegeOfficeContact;
}

export type PhonebookDetailState =
  | PersonPhonebookDetailState
  | OfficePhonebookDetailState;

const PHONEBOOK_DETAIL_STORAGE_KEY = "phonebook-detail";

function hasNumericId(value: unknown): value is { id: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "number"
  );
}

function isPhonebookDetailState(value: unknown): value is PhonebookDetailState {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return false;
  }

  const kind = (value as { kind: unknown }).kind;
  const entry = (value as { entry?: unknown }).entry;

  return (
    (kind === "person" || kind === "office") &&
    hasNumericId(entry)
  );
}

export function getPhonebookDetailPath(
  kind: PhonebookDetailKind,
  id: number,
) {
  const searchParams = new URLSearchParams({
    kind,
    id: String(id),
  });

  return `${ROUTES.PHONEBOOK.DETAIL}?${searchParams.toString()}`;
}

export function savePhonebookDetailState(state: PhonebookDetailState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PHONEBOOK_DETAIL_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function loadPhonebookDetailState(
  kind: PhonebookDetailKind,
  id: number,
) {
  if (typeof window === "undefined" || !Number.isFinite(id)) {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    PHONEBOOK_DETAIL_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (!isPhonebookDetailState(parsed)) {
      return null;
    }

    if (parsed.kind !== kind || parsed.entry.id !== id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
