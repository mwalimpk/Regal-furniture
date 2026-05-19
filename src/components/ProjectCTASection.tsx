import { BriefcaseBusiness, ClipboardList, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "2638644281361";

const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const ProjectCTASection = () => {
  const quoteHref = buildWhatsAppLink(
    "Hello Regal Office & Home, I would like to request a quote for a business or bulk furniture project.",
  );
  const supportHref = buildWhatsAppLink(
    "Hello Regal Office & Home, I would like help with products, pricing, and project options.",
  );

  return (
    <section className="bg-[#1a1f17] px-4 py-8 md:px-6 md:py-10">
      <div className="container mx-auto lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#4b421e] bg-[linear-gradient(135deg,#282d20_0%,#1d2117_100%)] px-6 py-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:px-10 md:py-10">
          <div className="absolute right-[-3rem] top-[-2rem] h-56 w-56 rounded-full border border-[#4b421e]/40" />
          <div className="absolute bottom-[-5rem] right-20 h-56 w-56 rounded-full border border-[#4b421e]/25" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e0ad3c]">
                <BriefcaseBusiness size={14} className="text-[#d7edf8]" />
                For Business & Bulk Buyers
              </div>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-[#f7f1e8] md:text-5xl">
                We Furnish <span className="text-[#e0ad3c]">Entire Spaces</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/66 md:text-base">
                Hotels, corporate offices, schools and property developers rely on us for project quotes,
                coordinated delivery, and custom furniture planning at scale.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <a
                href={quoteHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#d7a22c] px-6 py-3 text-sm font-semibold text-[#1e1b16] transition-transform duration-200 hover:translate-y-[-1px] hover:bg-[#e3ae35]"
              >
                <ClipboardList size={16} />
                Request a Quote
              </a>
              <a
                href={supportHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/18 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/6"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectCTASection;
