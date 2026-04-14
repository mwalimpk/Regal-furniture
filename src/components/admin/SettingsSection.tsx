import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsSection = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Settings</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <Settings size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Application settings will be configurable here. Site name, default currency, notification preferences, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
