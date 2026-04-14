import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AnalyticsSection = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Analytics</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Analytics dashboard coming soon. Charts and insights for property views, leads, and conversions will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
