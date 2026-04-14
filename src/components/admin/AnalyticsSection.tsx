import { Card, CardContent } from "@/components/ui/card";

const AnalyticsSection = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Analytics</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Analytics dashboard coming soon. Charts and insights for property views, leads, and conversions will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
