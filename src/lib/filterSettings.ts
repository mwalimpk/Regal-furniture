export type QuickFilterType = "max_price" | "min_price" | "keyword";

export type QuickFilter = {
  id: string;
  label: string;
  type: QuickFilterType;
  value: string;
  enabled: boolean;
};

export type FilterSettings = {
  showSearch: boolean;
  showMinPrice: boolean;
  showMaxPrice: boolean;
  showSort: boolean;
  quickFilters: QuickFilter[];
  collectionGroups: Record<string, string[]>;
};

const STORAGE_KEY = "regal-office-home-filter-settings-v1";

export const defaultFilterSettings: FilterSettings = {
  showSearch: true,
  showMinPrice: true,
  showMaxPrice: true,
  showSort: true,
  quickFilters: [
    { id: "qf-budget", label: "Under $500", type: "max_price", value: "500", enabled: true },
    { id: "qf-mid", label: "Under $1000", type: "max_price", value: "1000", enabled: true },
    { id: "qf-premium", label: "Premium", type: "min_price", value: "1000", enabled: true },
    { id: "qf-ergonomic", label: "Ergonomic", type: "keyword", value: "ergonomic", enabled: true },
  ],
  collectionGroups: {
    "executive-suites": ["executive-suites"],
    "office-suites": ["office-suites"],
    "conference-boardroom": ["conference-boardroom"],
    "reception-lobby": ["reception-lobby"],
    "home-office": ["home-office"],
    "industrial-laboratory": ["industrial-laboratory"],
    "accessories": ["accessories"],
  },
};

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const loadFilterSettings = (): FilterSettings => {
  if (!canUseStorage()) return defaultFilterSettings;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFilterSettings));
    return defaultFilterSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FilterSettings>;
    return {
      ...defaultFilterSettings,
      ...parsed,
      quickFilters: Array.isArray(parsed.quickFilters) ? parsed.quickFilters : defaultFilterSettings.quickFilters,
      collectionGroups:
        parsed.collectionGroups && typeof parsed.collectionGroups === "object"
          ? parsed.collectionGroups
          : defaultFilterSettings.collectionGroups,
    };
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFilterSettings));
    return defaultFilterSettings;
  }
};

export const saveFilterSettings = (settings: FilterSettings) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
