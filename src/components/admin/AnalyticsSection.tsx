import { Card, CardContent } from "@/components/ui/card";

const AnalyticsSection = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Reporting</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Analytics</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Storefront performance and conversion reporting will live here.
        </p>
      </div>
      <Card className="border-grid/25 bg-card shadow-none">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Analytics dashboard coming soon. Charts and insights for property views, leads, and conversions will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
