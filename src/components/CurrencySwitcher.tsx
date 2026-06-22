import { ArrowLeftRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { StoreCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const CurrencySwitcher = ({ className }: { className?: string }) => {
  const { currency, setCurrency, rate, isLoadingRate } = useCurrency();

  return (
    <label className={cn("inline-flex items-center gap-2 text-[rgb(var(--nav-ink-rgb)/1)]", className)}>
      <ArrowLeftRight className="h-4 w-4 text-heritage" aria-hidden="true" />
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as StoreCurrency)}
        className="h-9 border border-[rgb(var(--nav-divider-rgb)/1)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.12em] outline-none transition-colors hover:border-heritage"
        aria-label="Display currency"
      >
        <option value="USD">USD</option>
        <option value="ZWG">ZWG</option>
      </select>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[rgb(var(--nav-muted-rgb)/1)] xl:inline">
        {isLoadingRate ? "Rate…" : `1 USD = ${rate.toFixed(2)} ZWG`}
      </span>
    </label>
  );
};

export default CurrencySwitcher;
