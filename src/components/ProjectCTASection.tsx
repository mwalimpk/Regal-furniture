import { BriefcaseBusiness, ClipboardList, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "2638644281361";

const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const projectNotes = [
  "Workspace planning for executive offices, open-plan teams, and reception zones.",
  "Coordinated delivery, assembly, and specification support for business buyers.",
  "Bulk quote guidance for hotels, developers, schools, and corporate rollouts.",
];

const ProjectCTASection = () => {
  const quoteHref = buildWhatsAppLink(
    "Hello Regal Office & Home, I would like to request a quote for a business or bulk furniture project.",
  );
  const supportHref = buildWhatsAppLink(
    "Hello Regal Office & Home, I would like help with products, pricing, and project options.",
  );

  return (
    <section className="border-t border-grid/50 bg-[linear-gradient(180deg,rgb(var(--secondary)/0.52)_0%,rgb(var(--background)/1)_100%)] py-20 md:py-24">
      <div className="container mx-auto px-10">
        <div className="grid gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-label">
              <BriefcaseBusiness size={14} className="text-interactive" />
              For Business & Bulk Buyers
            </div>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              We furnish complete projects with a quieter, more disciplined buying path.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">
              Regal supports fit-outs at the scale of a single executive office or an entire workplace floor,
              with planning help, specification clarity, and faster access to bulk pricing.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={quoteHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 bg-heritage px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-heritage/90"
              >
                <ClipboardList size={16} />
                Request a Quote
              </a>
              <a
                href={supportHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 bg-card/80 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-card"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            {projectNotes.map((note, index) => (
              <div
                key={note}
                className={`bg-card/70 p-5 text-sm leading-7 text-muted-foreground ${
                  index > 0 ? "border-t border-grid/40" : ""
                }`}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectCTASection;
