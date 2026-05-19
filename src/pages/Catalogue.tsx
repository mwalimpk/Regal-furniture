import { ArrowDownToLine, ExternalLink, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cataloguePdfUrl = "/catalogue/regal-office-home-catalogue-2026.pdf";

const Catalogue = () => {
  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <Navbar />
      <main className="pt-[210px] md:pt-[230px]">
        <section className="container mx-auto px-4 pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e3d7c8] bg-white/90 p-8 shadow-[0_24px_80px_rgba(60,40,20,0.08)] md:p-12">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d8272]">Catalogue</p>
            <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#171a18] md:text-6xl">
              Download the full Regal product catalogue.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#665f56] md:text-base">
              Place your PDF at <span className="font-medium text-[#231f1c]">public/catalogue/regal-office-home-catalogue-2026.pdf</span>.
              Once it is there, this page becomes your client-facing catalogue hub for direct viewing and download.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={cataloguePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7b1f34] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#63182a]"
              >
                <ExternalLink size={16} />
                Open catalogue
              </a>
              <a
                href={cataloguePdfUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7c8b5] px-6 py-3 text-sm font-semibold text-[#231f1c] transition-colors hover:bg-[#fbf7f2]"
              >
                <ArrowDownToLine size={16} />
                Download PDF
              </a>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fbf7f2] p-5">
                <FileText className="text-[#7b1f34]" size={20} />
                <h2 className="mt-4 font-semibold text-[#1f1c18]">Single shareable link</h2>
                <p className="mt-2 text-sm leading-6 text-[#665f56]">
                  Use one clean URL in WhatsApp, email, or social posts instead of sending large files manually.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fbf7f2] p-5">
                <FileText className="text-[#7b1f34]" size={20} />
                <h2 className="mt-4 font-semibold text-[#1f1c18]">cPanel-friendly setup</h2>
                <p className="mt-2 text-sm leading-6 text-[#665f56]">
                  Because the PDF sits in the public folder, it works cleanly with static hosting and the current project server.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fbf7f2] p-5">
                <FileText className="text-[#7b1f34]" size={20} />
                <h2 className="mt-4 font-semibold text-[#1f1c18]">Ready for CMS later</h2>
                <p className="mt-2 text-sm leading-6 text-[#665f56]">
                  This can later be moved into admin-managed uploads once the backend media layer is extended.
                </p>
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
