import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductCategories } from "@/hooks/useProductCategories";
import { defaultFilterSettings, FilterSettings, QuickFilter, QuickFilterType, loadFilterSettings, saveFilterSettings } from "@/lib/filterSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CURRENCY_SETTINGS_REFRESH_KEY, type CurrencyRateSnapshot, type CurrencySettings } from "@/lib/currency";

const defaultCurrencySettings: CurrencySettings = {
  id: "storefront",
  auto_update: true,
  manual_rate: 27,
  fallback_rate: 27,
  profit_margin_enabled: false,
  profit_margin_usd: 0,
  cache_hours: 24,
  rate_source_url: "https://open.er-api.com/v6/latest/USD",
  last_live_rate: null,
  last_rate_updated_at: null,
  updated_at: new Date(0).toISOString(),
  user_id: null,
};

const emptyQuickFilter = (): QuickFilter => ({
  id: `qf-${Date.now()}`,
  label: "",
  type: "keyword",
  value: "",
  enabled: true,
});

const SettingsSection = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: productCategories = [] } = useProductCategories();
  const { data: filterSettings = defaultFilterSettings } = useQuery({
    queryKey: ["store-filter-settings"],
    queryFn: async () => loadFilterSettings(),
  });
  const { data: currencySettings = defaultCurrencySettings } = useQuery({
    queryKey: ["admin-currency-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("currency_settings").select("*").eq("id", "storefront").maybeSingle();
      if (error) throw new Error(error.message);
      const row = (data || defaultCurrencySettings) as CurrencySettings;
      return {
        ...defaultCurrencySettings,
        ...row,
        profit_margin_enabled: row.profit_margin_enabled === true,
        manual_rate: Number(row.manual_rate ?? defaultCurrencySettings.manual_rate),
        fallback_rate: Number(row.fallback_rate ?? defaultCurrencySettings.fallback_rate),
        profit_margin_usd: Number(row.profit_margin_usd ?? defaultCurrencySettings.profit_margin_usd),
        cache_hours: Number(row.cache_hours ?? defaultCurrencySettings.cache_hours),
        last_live_rate: row.last_live_rate === null ? null : Number(row.last_live_rate),
      };
    },
  });
  const categoryOptions = useMemo(
    () => productCategories.map((category) => ({ slug: category.slug, name: category.name })),
    [productCategories],
  );

  const [draft, setDraft] = useState<FilterSettings>(filterSettings);
  const [currencyDraft, setCurrencyDraft] = useState<CurrencySettings>(currencySettings);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [testingRate, setTestingRate] = useState(false);
  const [rateTest, setRateTest] = useState<CurrencyRateSnapshot | null>(null);

  useEffect(() => {
    setDraft(filterSettings);
  }, [filterSettings]);

  useEffect(() => {
    setCurrencyDraft(currencySettings);
  }, [currencySettings]);

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

  const saveCurrencySettings = async () => {
    setSavingCurrency(true);
    const payload = {
      id: "storefront",
      auto_update: currencyDraft.auto_update,
      profit_margin_enabled: currencyDraft.profit_margin_enabled,
      manual_rate: Math.max(0.000001, Number(currencyDraft.manual_rate || 0)),
      fallback_rate: Math.max(0.000001, Number(currencyDraft.fallback_rate || 0)),
      profit_margin_usd: Math.max(0, Number(currencyDraft.profit_margin_usd || 0)),
      cache_hours: Math.max(1, Math.round(Number(currencyDraft.cache_hours || 24))),
      rate_source_url: currencyDraft.rate_source_url.trim(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("currency_settings").upsert(payload, { onConflict: "id" });
    setSavingCurrency(false);

    if (error) {
      toast({ title: "Currency settings not saved", description: error.message, variant: "destructive" });
      return;
    }

    await qc.invalidateQueries({ queryKey: ["admin-currency-settings"] });
    await qc.invalidateQueries({ queryKey: ["currency-rate"] });
    if (typeof window !== "undefined") {
      const updatedAt = String(Date.now());
      window.localStorage.setItem(CURRENCY_SETTINGS_REFRESH_KEY, updatedAt);
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(CURRENCY_SETTINGS_REFRESH_KEY);
        channel.postMessage({ updatedAt });
        channel.close();
      }
    }
    toast({ title: "Currency settings saved", description: "Storefront pricing and conversions now use the updated rule." });
  };

  const testCurrencyRate = async () => {
    setTestingRate(true);
    const { data, error } = await supabase.functions.invoke("currency-rate", { body: {} });
    setTestingRate(false);
    if (error) {
      toast({ title: "Rate check failed", description: error.message, variant: "destructive" });
      return;
    }
    setRateTest(data as CurrencyRateSnapshot);
    await qc.invalidateQueries({ queryKey: ["currency-rate"] });
    await qc.invalidateQueries({ queryKey: ["admin-currency-settings"] });
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
                        placeholder="related-category-slug, another-category-slug"
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

      <Card className="border-grid/25 bg-card shadow-none">
        <CardContent className="space-y-7 p-6 md:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Pricing Rule</p>
            <h2 className="mt-2 font-serif text-2xl text-foreground">USD ↔ ZWG currency conversion</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              Control exchange-rate conversion and the optional USD inflation adjustment. When active, the adjustment is added to the USD base price first, then ZWG prices are converted from that adjusted USD amount.
            </p>
          </div>

          <label className="flex items-center justify-between gap-4 border border-grid/25 bg-background p-4">
            <div>
              <p className="font-medium text-foreground">Activate inflation price adjustment</p>
              <p className="mt-1 text-xs text-muted-foreground">Keep this off until pricing needs to absorb a dollar-based inflation change.</p>
            </div>
            <input
              type="checkbox"
              checked={currencyDraft.profit_margin_enabled}
              onChange={(event) => setCurrencyDraft((current) => ({ ...current, profit_margin_enabled: event.target.checked }))}
              className="h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between border border-grid/25 bg-background p-4">
            <div>
              <p className="font-medium text-foreground">Automatically update the USD/ZWG rate</p>
              <p className="mt-1 text-xs text-muted-foreground">Uses the configured exchange-rate endpoint and the cache period below.</p>
            </div>
            <input
              type="checkbox"
              checked={currencyDraft.auto_update}
              onChange={(event) => setCurrencyDraft((current) => ({ ...current, auto_update: event.target.checked }))}
              className="h-4 w-4"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label>Inflation adjustment (USD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currencyDraft.profit_margin_usd}
                onChange={(event) => setCurrencyDraft((current) => ({ ...current, profit_margin_usd: Number(event.target.value) }))}
                disabled={!currencyDraft.profit_margin_enabled}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Manual rate (ZWG per USD)</Label>
              <Input
                type="number"
                min="0.000001"
                step="0.000001"
                value={currencyDraft.manual_rate}
                onChange={(event) => setCurrencyDraft((current) => ({ ...current, manual_rate: Number(event.target.value) }))}
                disabled={currencyDraft.auto_update}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Fallback rate</Label>
              <Input
                type="number"
                min="0.000001"
                step="0.000001"
                value={currencyDraft.fallback_rate}
                onChange={(event) => setCurrencyDraft((current) => ({ ...current, fallback_rate: Number(event.target.value) }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Rate cache (hours)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={currencyDraft.cache_hours}
                onChange={(event) => setCurrencyDraft((current) => ({ ...current, cache_hours: Number(event.target.value) }))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Exchange-rate endpoint</Label>
            <Input
              type="url"
              value={currencyDraft.rate_source_url}
              onChange={(event) => setCurrencyDraft((current) => ({ ...current, rate_source_url: event.target.value }))}
              disabled={!currencyDraft.auto_update}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-3 border border-grid/25 bg-background p-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last live rate</p>
              <p className="mt-2 font-medium text-foreground">
                {currencySettings.last_live_rate ? `1 USD = ${currencySettings.last_live_rate.toFixed(6)} ZWG` : "Not fetched yet"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last updated</p>
              <p className="mt-2 font-medium text-foreground">
                {currencySettings.last_rate_updated_at ? new Date(currencySettings.last_rate_updated_at).toLocaleString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest check</p>
              <p className="mt-2 font-medium text-foreground">
                {rateTest ? `${rateTest.rate.toFixed(6)} ZWG/USD (${rateTest.source})` : "Use Check Rate"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveCurrencySettings} disabled={savingCurrency}>
              {savingCurrency ? "Saving…" : "Save Currency Settings"}
            </Button>
            <Button variant="outline" onClick={testCurrencyRate} disabled={testingRate}>
              <RefreshCw className={`h-4 w-4 ${testingRate ? "animate-spin" : ""}`} />
              {testingRate ? "Checking…" : "Check Rate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
