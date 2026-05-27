import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const MessagesSection = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Inbox</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Messages</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Review recent customer messages captured by the local store workspace.
        </p>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !messages?.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className="border-grid/25 bg-card shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{m.subject || "No subject"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{m.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
