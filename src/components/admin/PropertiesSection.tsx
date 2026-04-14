import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PropertiesSection = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Properties</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !properties?.length ? (
        <p className="text-muted-foreground">No properties yet.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.property_type}</TableCell>
                  <TableCell>{p.currency} {Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>{p.city}, {p.country}</TableCell>
                  <TableCell><Badge className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PropertiesSection;
