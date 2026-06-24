import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, Leaf, ShieldCheck, Target, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import heroOffice from "@/assets/hero-office.jpg";
import aboutAfricanTeam from "@/assets/about-african-team.png";
import leadershipJonathan from "@/assets/leadership-jonathan-rubayah.jpg";
import leadershipLilian from "@/assets/leadership-lilian-rubayah.jpg";
import productWorkstation from "@/assets/product-workstation.jpg";
import productConference from "@/assets/product-conference.jpg";
import productStorage from "@/assets/product-storage.jpg";

const values = [
  {
    title: "Flexibility",
    body: "We adapt to changing customer expectations through practical management, broad product choice, and continuous product development.",
  },
  {
    title: "Integrity",
    body: "We act honestly and fairly with clients and suppliers, building the kind of relationships that can be trusted over time.",
  },
  {
    title: "Kaizen",
    body: "We keep improving our processes, aiming for steady innovation and better outcomes across the business.",
  },
  {
    title: "Commitment",
    body: "We are committed to achievement, quality, and the habit of doing work properly.",
  },
];

const productGroups = [
  "Executive, management, operator, and stacking chair options",
  "Executive, standard, budget, workstation, sit-and-stand, and home-office desking",
  "Filing cabinets, stationery cabinets, credenzas, and display storage",
  "Letter trays, bins, foot rests, coat hangers, fans, fridges, blinds, curtains, partitions, and repairs",
  "Bedroom, dining, kitchen, and lounge furniture for home spaces",
];

const commitments = [
  {
    title: "Material responsibility",
    body: "Regal gives preference to practical material choices, recyclable inputs, and equipment decisions that reduce avoidable environmental impact.",
    icon: Leaf,
  },
  {
    title: "Cleaner operations",
    body: "Day-to-day work is guided by waste reduction, recycling habits, and attention to the effect operations have on surrounding communities.",
    icon: ClipboardCheck,
  },
  {
    title: "Safe working culture",
    body: "The team treats training, supervision, hazard awareness, and employee consultation as part of responsible service delivery.",
    icon: ShieldCheck,
  },
];

const leadership = [
  {
    name: "Jonathan Rubayah",
    role: "Shareholder & COO",
    body: "Jonathan leads business strategy, day-to-day operations, standards, and long-term goals, drawing on furniture-industry management experience and a passion for high-quality products.",
    image: leadershipJonathan,
    imagePosition: "center top",
  },
  {
    name: "Lilian S Rubayah",
    role: "Shareholder & Company Secretary",
    body: "Lilian supports financial and legal compliance while helping maintain high standards of corporate governance.",
    image: leadershipLilian,
    imagePosition: "center top",
  },
];

const registrations = [
  ["Company number", "2495/2021"],
  ["Registration number", "28836A0112025"],
  ["ZIMRA TIN", "2001370632"],
  ["ZIMRA VAT", "220404168"],
  ["PRAZ registration", "PR57761033019"],
  ["Vendor number", "720967"],
  ["NSSA registration", "0219094H"],
];

const branches = [
  {
    city: "Harare",
    address: "DDK Centre, 68 Enterprise Rd, Newlands",
    phones: ["+263 8644 281 361", "+263 780 472 180", "+263 712 012 913"],
  },
  {
    city: "Bulawayo",
    address: "Norvaal House, 68 Fife Street, Corner Sixth Avenue",
    phones: ["+263 8644 041 571", "+263 787 781 470", "+263 718 907 161"],
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <Navbar />

      <main className="pt-[96px] lg:pt-[172px]">
        <section className="border-b border-grid/40 bg-background">
          <div className="container mx-auto grid min-h-[calc(100vh-172px)] gap-10 px-10 py-10 lg:grid-cols-[0.45fr_0.55fr] lg:items-stretch lg:py-14">
            <div className="flex flex-col justify-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">About Regal Office & Home</p>
              <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] text-foreground md:text-7xl">
                Furniture solutions for spaces that need to work beautifully.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                Regal Office & Home brings together furniture manufacturing experience, showroom service, product knowledge, and responsible operating standards for residential, commercial, and corporate spaces.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/categories"
                  className="inline-flex min-h-14 items-center justify-center gap-2 bg-heritage px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-heritage/90"
                >
                  Explore collections
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/catalogue"
                  className="inline-flex min-h-14 items-center justify-center gap-2 border border-grid/45 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
                >
                  View catalogue
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 border-y border-grid/35 py-5">
                <div>
                  <p className="font-serif text-3xl text-foreground">2021</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Registered</p>
                </div>
                <div className="border-l border-grid/35 pl-5">
                  <p className="font-serif text-3xl text-foreground">2</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">City branches</p>
                </div>
                <div className="border-l border-grid/35 pl-5">
                  <p className="font-serif text-3xl text-foreground">7</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Core ranges</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden bg-card lg:min-h-0">
              <img
                src={heroOffice}
                alt="Regal office workspace"
                className="h-full w-full object-cover"
              />
              <div className="media-mask absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="max-w-md font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground/78">
                  Modern design. Durable construction. Practical support from consultation to installation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-inverse py-20 md:py-24">
          <div className="container mx-auto px-10">
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.62)]">Leadership</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-[rgb(var(--inverse-foreground-rgb)/1)] md:text-5xl">
                  Governance, strategy, and customer knowledge working together.
                </h2>
              </div>
              <UsersRound className="hidden h-12 w-12 text-interactive md:block" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {leadership.map((person) => (
                <div
                  key={person.name}
                  tabIndex={0}
                  className="group relative min-h-[380px] overflow-hidden border border-[rgb(var(--inverse-foreground-rgb)/0.16)] bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background md:min-h-[440px]"
                >
                  <img
                    src={person.image}
                    alt={`${person.name}, ${person.role}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                    style={{ objectPosition: person.imagePosition }}
                    loading="lazy"
                  />
                  <div className="collection-image-scrim absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 md:p-6">
                    <p className="collection-image-adaptive font-mono text-[10px] uppercase tracking-[0.22em] opacity-80">{person.role}</p>
                    <h3 className="collection-image-adaptive mt-3 max-w-md font-serif text-3xl leading-tight md:text-4xl">{person.name}</h3>
                  </div>
                  <div className="collection-hover-panel absolute inset-0 z-20 flex translate-y-full flex-col justify-between p-5 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 md:p-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                        {person.role}
                      </p>
                      <h3 className="mt-4 max-w-lg font-serif text-3xl leading-tight text-[rgb(var(--collection-hover-foreground-rgb)/1)] md:text-4xl">
                        {person.name}
                      </h3>
                    </div>
                    <div className="translate-y-5 opacity-0 transition-all delay-100 duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <p className="text-sm leading-7 text-[rgb(var(--collection-hover-muted-rgb)/1)] md:text-base md:leading-8">
                        {person.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-20 md:py-24">
          <div className="container mx-auto grid gap-12 px-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
            <div className="overflow-hidden bg-card">
              <img
                src={aboutAfricanTeam}
                alt="African Regal workplace specialists reviewing furniture finishes and a floor plan"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Our company</p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
                We combine craftsmanship, comfort, and service for contemporary living and working.
              </h2>
              <div className="mt-7 grid gap-6 text-sm leading-8 text-muted-foreground md:grid-cols-2">
                <p>
                  Regal produces and retails furniture for contemporary work and living, balancing style, durability, comfort, and practical support for clients choosing single pieces or complete environments.
                </p>
                <p>
                  Its operating culture pairs customer care with disciplined processes, supplier relationships, and awareness of the environmental and safety responsibilities attached to the work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-inverse py-20 md:py-24">
          <div className="container mx-auto px-10">
            <div className="grid gap-10 lg:grid-cols-[0.36fr_0.64fr] lg:items-start">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.62)]">Mission & ethics</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-[rgb(var(--inverse-foreground-rgb)/1)] md:text-5xl">
                  Built around ergonomics, work comfort, and quality of life.
                </h2>
                <p className="mt-5 text-sm leading-8 text-[rgb(var(--inverse-foreground-rgb)/0.68)]">
                  The company approaches each brief as a complete furniture solution, shaped by the customer's use case, comfort expectations, budget, and long-term relationship with the brand.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {values.map((value) => (
                  <div key={value.title} className="border border-[rgb(var(--inverse-foreground-rgb)/0.16)] p-6">
                    <BadgeCheck className="h-5 w-5 text-interactive" />
                    <h3 className="mt-5 font-serif text-2xl text-[rgb(var(--inverse-foreground-rgb)/1)]">{value.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[rgb(var(--inverse-foreground-rgb)/0.68)]">{value.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-grid/40 bg-background py-20 md:py-24">
          <div className="container mx-auto px-10">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.4fr_0.6fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Product capability</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                  A broad range for offices, homes, institutions, and project buyers.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-8 text-muted-foreground lg:justify-self-end">
                Regal serves executive offices, open-plan teams, reception areas, conference rooms, storage needs, home interiors, and supporting installations.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[productWorkstation, productConference, productStorage].map((image, index) => (
                <div key={image} className="overflow-hidden bg-card">
                  <img
                    src={image}
                    alt={["Workstation furniture", "Boardroom furniture", "Office storage furniture"][index]}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {productGroups.map((item) => (
                <div key={item} className="border-t border-grid/35 pt-4 text-sm leading-7 text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,rgb(var(--secondary)/0.46)_0%,rgb(var(--background)/1)_100%)] py-20 md:py-24">
          <div className="container mx-auto px-10">
            <div className="grid gap-12 lg:grid-cols-[0.46fr_0.54fr] lg:items-start">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Responsibility</p>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
                  Environmental care, safer work, and customer service sit inside the same operating standard.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-muted-foreground">
                  Regal's responsibility commitments extend beyond product appearance. They shape material choices, workplace conduct, supplier expectations, and how the team responds to risks in daily operations.
                </p>
              </div>
              <div className="grid gap-5">
                {commitments.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="grid gap-4 border border-grid/25 bg-card/70 p-6 sm:grid-cols-[auto_1fr]">
                      <div className="flex h-11 w-11 items-center justify-center border border-grid/30 text-heritage">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-20 md:py-24">
          <div className="container mx-auto grid gap-10 px-10 lg:grid-cols-[0.44fr_0.56fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Company details</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                Registered, reachable, and ready to support the next workspace.
              </h2>
              <div className="mt-8 grid gap-5">
                {branches.map((branch) => (
                  <div key={branch.city} className="border-t border-grid/35 pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">{branch.city}</p>
                    <p className="mt-2 text-sm leading-7 text-foreground">{branch.address}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{branch.phones.join(" / ")}</p>
                  </div>
                ))}
                <a href="mailto:info@regalfurn.co.zw" className="inline-flex w-fit items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-interactive hover:text-interactive">
                  info@regalfurn.co.zw
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="grid gap-3 border border-grid/25 bg-card/60 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-label">
                  <Building2 size={15} className="text-heritage" />
                  Registrations
                </div>
              </div>
              {registrations.map(([label, value]) => (
                <div key={label} className="border-t border-grid/30 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-grid/40 bg-[rgb(var(--secondary)/0.48)] py-16">
          <div className="container mx-auto grid gap-6 px-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-label">
                <Target size={15} className="text-heritage" />
                Build with Regal
              </div>
              <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
                Let us help shape an office, home, or project environment with furniture that fits the way it will be used.
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex min-h-14 items-center justify-center gap-2 bg-heritage px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-heritage/90"
            >
              Start browsing
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default About;
