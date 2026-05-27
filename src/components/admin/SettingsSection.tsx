import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categories } from "@/data/products";
import { defaultFilterSettings, FilterSettings, QuickFilter, QuickFilterType, loadFilterSettings, saveFilterSettings } from "@/lib/filterSettings";

const emptyQuickFilter = (): QuickFilter => ({
  id: `qf-${Date.now()}`,
  label: "",
  type: "keyword",
  value: "",
  enabled: true,
});

const categoryOptions = categories.map((category) => ({
  slug: category.slug,
  name: category.name,
}));

const SettingsSection = () => {
  const qc = useQueryClient();
  const { data: filterSettings = defaultFilterSettings } = useQuery({
    queryKey: ["store-filter-settings"],
    queryFn: async () => loadFilterSettings(),
  });

  const [draft, setDraft] = useState<FilterSettings>(filterSettings);

  useEffect(() => {
    setDraft(filterSettings);
  }, [filterSettings]);

  const syncDraft = (next: FilterSettings) => {
    setDraft(next);
  };

  const updateQuickFilter = (id: string, patch: Partial<QuickFilter>) => {
    syncDraft({
      ...draft,
      quickFilters: draft.quickFilters.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  };

  const removeQuickFilter = (id: string) => {
    syncDraft({
      ...draft,
      quickFilters: draft.quickFilters.filter((item) => item.id !== id),
    });
  };

  const updateCollectionGroup = (slug: string, value: string) => {
    const nextValues = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    syncDraft({
      ...draft,
      collectionGroups: {
        ...draft.collectionGroups,
        [slug]: nextValues,
      },
    });
  };

  const saveSettings = () => {
    saveFilterSettings(draft);
    qc.invalidateQueries({ queryKey: ["store-filter-settings"] });
  };

  const resetDefaults = () => {
    saveFilterSettings(defaultFilterSettings);
    setDraft(defaultFilterSettings);
    qc.invalidateQueries({ queryKey: ["store-filter-settings"] });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Configuration</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Settings</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Control storefront filter behavior from the admin workspace.
        </p>
      </div>
      <Card className="border-grid/25 bg-card shadow-none">
        <CardContent className="p-6 md:p-8 space-y-8">
          <div>
            <h2 className="font-serif text-xl text-foreground">Category Filter Controls</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These settings control which storefront filters appear on category pages and which quick-filter chips are available to shoppers.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { key: "showSearch", label: "Show search field" },
              { key: "showMinPrice", label: "Show minimum price" },
              { key: "showMaxPrice", label: "Show maximum price" },
              { key: "showSort", label: "Show sort menu" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between border border-grid/20 bg-background px-4 py-3">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <input
                  type="checkbox"
                  checked={draft[item.key as keyof FilterSettings] as boolean}
                  onChange={(e) => syncDraft({ ...draft, [item.key]: e.target.checked })}
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Quick Filter Chips</h3>
                <p className="text-sm text-muted-foreground">Add, remove, or disable shortcut filters shown above the catalog grid.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => syncDraft({ ...draft, quickFilters: [...draft.quickFilters, emptyQuickFilter()] })}
              >
                Add Filter
              </Button>
            </div>

            <div className="space-y-3">
              {draft.quickFilters.map((filter) => (
                <div key={filter.id} className="border border-grid/20 bg-background p-4">
                  <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={filter.label}
                        onChange={(e) => updateQuickFilter(filter.id, { label: e.target.value })}
                        placeholder="Under $500"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select
                        value={filter.type}
                        onChange={(e) => updateQuickFilter(filter.id, { type: e.target.value as QuickFilterType })}
                        className="mt-1.5 h-10 w-full border border-input bg-background px-3 text-sm"
                      >
                        <option value="keyword">Keyword</option>
                        <option value="max_price">Max price</option>
                        <option value="min_price">Min price</option>
                      </select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={filter.value}
                        onChange={(e) => updateQuickFilter(filter.id, { value: e.target.value })}
                        placeholder={filter.type === "keyword" ? "ergonomic" : "500"}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filter.enabled}
                          onChange={(e) => updateQuickFilter(filter.id, { enabled: e.target.checked })}
                        />
                        Enabled
                      </label>
                      <Button variant="ghost" className="text-destructive" onClick={() => removeQuickFilter(filter.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Collection Dropdown Groups</h3>
              <p className="text-sm text-muted-foreground">
                Control which related collections appear in the category filter dropdown. Use category slugs separated by commas.
              </p>
            </div>

            <div className="space-y-3">
              {categoryOptions.map((category) => (
                <div key={category.slug} className="border border-grid/20 bg-background p-4">
                  <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.slug}</p>
                    </div>
                    <div>
                      <Label>Visible related collections</Label>
                      <Input
                        value={(draft.collectionGroups[category.slug] || []).join(", ")}
                        onChange={(e) => updateCollectionGroup(category.slug, e.target.value)}
                        placeholder="executive-desking, managerial-desking"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="bg-heritage text-primary-foreground hover:bg-heritage/90" onClick={saveSettings}>
              Save Filter Settings
            </Button>
            <Button variant="outline" onClick={resetDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
