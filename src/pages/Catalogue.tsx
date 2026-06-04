import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, CalendarDays, ExternalLink, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type CatalogueRecord = {
  id: string;
  title: string;
  category: string;
  year: number;
  month: number;
  document_url: string;
  document_name: string;
  document_type: string;
  cover_image_url: string;
  imported_count: number;
  status: string;
  created_at: string;
};

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const formatCataloguePeriod = (catalogue: CatalogueRecord) => {
  const month = monthOptions.find((option) => option.value === String(catalogue.month));
  return [month?.label, catalogue.year].filter(Boolean).join(" ");
};

const Catalogue = () => {
  const {
    data: catalogues = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["public-catalogues"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("catalogues")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      return [...((data || []) as CatalogueRecord[])].sort(
        (left, right) =>
          right.year - left.year ||
          right.month - left.month ||
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[96px] lg:pt-[172px]">
        <section className="bg-[linear-gradient(180deg,rgb(var(--secondary)/0.56)_0%,rgb(var(--background)/1)_100%)]">
          <div className="container mx-auto px-10 py-10 md:py-14">
            <div className="max-w-4xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Catalogue</p>
              <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground md:text-6xl">
                Browse the latest Regal catalogue uploads.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Every catalogue shown here comes from the admin catalogue library. Open a cover to view the uploaded PDF in your browser, or download the same file directly.
              </p>
            </div>

            {isLoading ? (
              <div className="mt-12 border border-grid/25 surface-elevated px-6 py-14 text-center text-sm text-muted-foreground">
                Loading catalogues...
              </div>
            ) : error ? (
              <div className="mt-12 border border-destructive/30 bg-destructive/10 px-6 py-14 text-center text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load catalogues."}
              </div>
            ) : catalogues.length === 0 ? (
              <div className="mt-12 border border-grid/25 surface-elevated px-6 py-14 text-center">
                <FileText className="mx-auto text-heritage" size={28} />
                <h2 className="mt-4 font-serif text-2xl text-foreground">No catalogues uploaded yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload catalogue documents and cover images from the admin site to populate this page.
                </p>
              </div>
            ) : (
              <div className="mt-12 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {catalogues.map((catalogue) => (
                  <article key={catalogue.id} className="group flex h-full flex-col border border-grid/25 bg-card">
                    <a
                      href={catalogue.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative block aspect-[3/4] overflow-hidden bg-muted"
                      aria-label={`Open ${catalogue.title}`}
                    >
                      <img
                        src={catalogue.cover_image_url}
                        alt={catalogue.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center bg-crimson text-primary-foreground shadow-sm transition-colors group-hover:bg-crimson/90">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </a>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                          {catalogue.category}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                          <CalendarDays className="h-3 w-3" />
                          {formatCataloguePeriod(catalogue)}
                        </span>
                      </div>

                      <h2 className="mt-4 font-serif text-2xl leading-tight text-foreground">
                        {catalogue.title}
                      </h2>
                      <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">
                        {catalogue.document_name}
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <a
                          href={catalogue.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center justify-center gap-2 bg-crimson px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-crimson/90"
                        >
                          Open
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={catalogue.document_url}
                          download={catalogue.document_name || true}
                          className="inline-flex min-h-11 items-center justify-center gap-2 border border-grid/35 bg-background px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
                        >
                          Download
                          <ArrowDownToLine className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
