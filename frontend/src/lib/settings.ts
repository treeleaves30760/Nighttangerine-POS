export type DisplaySettings = {
  showMarquee: boolean;
  marqueeText: string;
};

const LS_KEY = "customerDisplaySettings";

const defaultSettings: DisplaySettings = {
  showMarquee: true,
  marqueeText: "夜橘深夜食堂開張中",
};

function read(): DisplaySettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      showMarquee: Boolean(parsed.showMarquee),
      marqueeText: String(parsed.marqueeText || ""),
    } satisfies DisplaySettings;
  } catch {
    return defaultSettings;
  }
}

function write(value: DisplaySettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(value));
}

export const settingsApi = {
  get(): DisplaySettings {
    return read();
  },
  set(partial: Partial<DisplaySettings>) {
    const current = read();
    const next: DisplaySettings = { ...current, ...partial };
    write(next);
  },
  key: LS_KEY,
};
