import { ArrowDownToLine, ExternalLink, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cataloguePdfUrl = "/catalogue/regal-office-home-catalogue-2026.pdf";

const catalogueNotes = [
  {
    title: "Single shareable link",
    body: "Use one clean URL in WhatsApp, email, or social posts instead of sending large files manually.",
  },
  {
    title: "Hosting-friendly setup",
    body: "Because the PDF sits in the public folder, it works cleanly with the current project server and static deployments.",
  },
  {
    title: "Ready for CMS later",
    body: "This can later be moved into admin-managed uploads once the backend media layer is extended.",
  },
];

const Catalogue = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[96px] lg:pt-[172px]">
        <section className="bg-[linear-gradient(180deg,rgb(var(--secondary)/0.56)_0%,rgb(var(--background)/1)_100%)]">
          <div className="container mx-auto px-10 py-10 md:py-14">
            <div className="mx-auto max-w-5xl border border-grid/30 surface-elevated p-8 md:p-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Catalogue</p>
              <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-foreground md:text-6xl">
                Download the full Regal product catalogue.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Place your PDF at{" "}
                <span className="font-medium text-foreground">
                  public/catalogue/regal-office-home-catalogue-2026.pdf
                </span>.
                Once it is there, this page becomes your client-facing catalogue hub for direct viewing and download.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={cataloguePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-heritage px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-heritage/90"
                >
                  <ExternalLink size={16} />
                  Open catalogue
                </a>
                <a
                  href={cataloguePdfUrl}
                  download
                  className="inline-flex items-center justify-center gap-2 border border-grid/40 surface-soft px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[rgb(var(--surface-elevated-rgb)/1)]"
                >
                  <ArrowDownToLine size={16} />
                  Download PDF
                </a>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {catalogueNotes.map((note) => (
                  <div key={note.title} className="border border-grid/20 surface-soft p-5">
                    <FileText className="text-heritage" size={20} />
                    <h2 className="mt-4 font-semibold text-foreground">{note.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalogue;
