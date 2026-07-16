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

function isStoredReaderState(value: unknown): value is StoredReaderState {
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
    typeof state.updatedAt === "string" &&
    Number.isFinite(Date.parse(state.updatedAt))
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
    updatedAt: state.updatedAt ?? new Date().toISOString(),
  } satisfies StoredReaderState);
}
