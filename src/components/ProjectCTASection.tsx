import { BriefcaseBusiness, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { buildWhatsAppCallLink, buildWhatsAppLink } from "@/lib/contact";
import { useProductInstitutions } from "@/hooks/useProductInstitutions";

const WhatsAppLogo = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M16.03 4.8A11.05 11.05 0 0 0 6.6 21.58L5.2 26.8l5.34-1.4A11.04 11.04 0 1 0 16.03 4.8Zm0 2.08a8.96 8.96 0 0 1 7.62 13.66 8.95 8.95 0 0 1-11.9 3.28l-.38-.22-3.18.84.85-3.1-.25-.4a8.96 8.96 0 0 1 7.24-14.06Zm-3.82 4.5c-.2 0-.52.07-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.35 5.2 4.56 2.58 1.02 3.1.82 3.66.77.56-.05 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.47-.08-.14-.28-.22-.58-.37-.3-.15-1.82-.9-2.1-1-.28-.11-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.36.23-.67.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.8-1.69-2.1-.18-.3-.02-.47.14-.62.14-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.94-2.25-.24-.58-.5-.5-.68-.5h-.58Z" />
  </svg>
);

const ProjectCTASection = () => {
  const { data: institutions = [] } = useProductInstitutions();
  const quoteHref = buildWhatsAppCallLink();
  const supportHref = buildWhatsAppLink(
    "Hello Regal Office & Home, I would like help with products, pricing, and project options.",
  );

  return (
    <section className="border-t border-grid/50 bg-[linear-gradient(180deg,rgb(var(--secondary)/0.52)_0%,rgb(var(--background)/1)_100%)] py-20 md:py-24">
      <div className="container mx-auto px-10">
        <div className="grid gap-12 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-label">
              <BriefcaseBusiness size={14} className="text-interactive" />
              For Business & Bulk Buyers
            </div>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              Furnishing the institutions and service spaces people rely on every day.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-muted-foreground md:text-base">
              Regal supports bulk and project furniture requirements for public offices, healthcare facilities,
              hotels, schools, corporate workplaces, and property developers with specification guidance,
              coordinated delivery, and practical product choices for high-use environments.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={quoteHref}
                className="inline-flex min-h-14 items-center justify-center gap-2 bg-heritage px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-heritage/90"
              >
                <ClipboardList size={16} />
                Request a Quote
              </a>
              <a
                href={supportHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#25D366] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#062c17] transition-colors hover:bg-[#1fb85a]"
              >
                <WhatsAppLogo />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {institutions.map((institution) => (
              <Link
                key={institution.id}
                to={`/institution/${institution.slug}`}
                className="group relative min-h-[250px] overflow-hidden bg-card focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`${institution.name}: ${institution.description}`}
              >
                <img
                  src={institution.imageUrl}
                  alt={`${institution.name} furniture solutions`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="collection-image-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-foreground/72">
                    Sector support
                  </p>
                  <h3 className="mt-3 font-serif text-3xl leading-tight text-primary-foreground">
                    {institution.name}
                  </h3>
                </div>
                <div className="collection-hover-panel absolute inset-0 z-20 flex translate-y-full flex-col justify-between p-5 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus:translate-y-0">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                      Bulk project fit-outs
                    </p>
                    <h3 className="mt-4 font-serif text-3xl leading-tight text-[rgb(var(--collection-hover-foreground-rgb)/1)]">
                      {institution.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                    {institution.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectCTASection;
