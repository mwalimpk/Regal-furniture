import { Card, CardContent } from "@/components/ui/card";

const SettingsSection = () => {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Settings</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Application settings will be configurable here. Site name, default currency, notification preferences, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
