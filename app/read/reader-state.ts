export type FontSize = "small" | "standard" | "large";
export type ReaderTheme = "day" | "night";

export type StoredReaderState = {
  version: 1;
  chapterSlug: string;
  fontSize: FontSize;
  theme: ReaderTheme;
  anchor?: string;
  progress: number;
  updatedAt: string;
};

const fontSizes: ReadonlyArray<FontSize> = ["small", "standard", "large"];

function isCanonicalUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function isStoredReaderState(value: unknown): value is StoredReaderState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoredReaderState>;
  return (
    state.version === 1 &&
    typeof state.chapterSlug === "string" &&
    state.chapterSlug.length > 0 &&
    fontSizes.some((fontSize) => fontSize === state.fontSize) &&
    (state.theme === "day" || state.theme === "night") &&
    typeof state.progress === "number" &&
    Number.isFinite(state.progress) &&
    state.progress >= 0 &&
    state.progress <= 100 &&
    (state.anchor === undefined || typeof state.anchor === "string") &&
    isCanonicalUtcTimestamp(state.updatedAt)
  );
}

export function parseStoredReaderState(serialized: string | null) {
  if (!serialized) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isStoredReaderState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeReaderState(
  state: Omit<StoredReaderState, "version" | "updatedAt"> & { updatedAt?: string },
) {
  return JSON.stringify({
    ...state,
    version: 1,
    updatedAt: state.updatedAt
      ? new Date(state.updatedAt).toISOString()
      : new Date().toISOString(),
  } satisfies StoredReaderState);
}

export function mergeStoredReaderStates(
  localState: StoredReaderState | null,
  cloudState: StoredReaderState | null,
) {
  if (!localState) return cloudState;
  if (!cloudState) return localState;

  return Date.parse(localState.updatedAt) > Date.parse(cloudState.updatedAt)
    ? localState
    : cloudState;
}
