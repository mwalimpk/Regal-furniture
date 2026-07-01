import type { FormEvent } from "react";
import { ArrowRight, Building2, Clock, Mail, MapPin, MessageSquare, Phone, Send, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import contactAfricanConsultation from "@/assets/contact-african-consultation.png";
import productConference from "@/assets/product-conference.jpg";
import productWorkstation from "@/assets/product-workstation.jpg";

const branches = [
  {
    city: "Harare",
    address: "DDK Centre, 68 Enterprise Rd, Newlands",
    mapQuery: "DDK Centre, 68 Enterprise Rd, Newlands, Harare, Zimbabwe",
    phones: ["+263 8644 281 361", "+263 780 472 180", "+263 712 012 913"],
    salesPhone: "+263780472180",
    whatsapp: "+263780472180",
    email: "info@regalfurn.co.zw",
    note: "Showroom, projects, bulk buying, and customer support.",
  },
  {
    city: "Bulawayo",
    address: "Norvaal House, 68 Fife Street, Corner Sixth Avenue",
    mapQuery: "Norvaal House, 68 Fife Street, Corner Sixth Avenue, Bulawayo, Zimbabwe",
    phones: ["+263 8644 041 571", "+263 787 781 470", "+263 718 907 161"],
    salesPhone: "+263787781470",
    whatsapp: "+263787781470",
    email: "info@regalfurn.co.zw",
    note: "Regional support for office, home, institutional, and project orders.",
  },
];

const googleMapsEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

const googleMapsSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const enquiryTypes = [
  "Office fit-out",
  "Bulk purchase",
  "Home furniture",
  "Hospitality or institutional supply",
  "Catalogue product enquiry",
  "After-sales support",
];

const processSteps = [
  {
    title: "Send the brief",
    body: "Share the rooms, quantities, location, preferred finishes, and delivery expectations.",
  },
  {
    title: "Match the range",
    body: "The team aligns your request with catalogue items, showroom stock, or project-ready alternatives.",
  },
  {
    title: "Confirm the route",
    body: "You receive next steps for pricing, availability, delivery, installation, or a showroom visit.",
  },
];

const Contact = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Website enquiry: ${formData.get("enquiryType") || "General"}`);
    const body = encodeURIComponent(
      [
        `Name: ${formData.get("name") || ""}`,
        `Email: ${formData.get("email") || ""}`,
        `Phone: ${formData.get("phone") || ""}`,
        `Warehouse: ${formData.get("warehouse") || ""}`,
        `Enquiry: ${formData.get("enquiryType") || ""}`,
        "",
        String(formData.get("message") || ""),
      ].join("\n"),
    );

    window.location.href = `mailto:info@regalfurn.co.zw?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <Navbar />

      <main className="pt-[96px] lg:pt-[172px]">
        <section className="relative min-h-[calc(100svh-96px)] overflow-hidden border-b border-grid/40 lg:min-h-[calc(100svh-172px)]">
          <img
            src={contactAfricanConsultation}
            alt="African Regal consultant helping a client plan an office furniture layout"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(12_14_10/0.88)_0%,rgb(12_14_10/0.56)_48%,rgb(12_14_10/0.22)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_28%,rgb(var(--interactive-rgb)/0.22),transparent_24%)]" />

          <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-96px)] flex-col justify-end px-10 pb-12 pt-16 text-white lg:min-h-[calc(100svh-172px)] lg:pb-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/70">Contact Regal Office & Home</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.96] tracking-[-0.04em] text-white md:text-7xl lg:text-8xl">
              Start with the space. We will help shape the furniture plan.
            </h1>
            <div className="mt-8 grid max-w-5xl gap-6 border-t border-white/20 pt-6 lg:grid-cols-[0.62fr_0.38fr]">
              <p className="max-w-2xl text-sm leading-7 text-white/76 md:text-base md:leading-8">
                Talk to Regal about individual pieces, office rollouts, showroom visits, institutional supply, or after-sales support across Harare and Bulawayo.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
                <a
                  href="#enquiry"
                  className="sm:col-span-2 inline-flex min-h-12 items-center justify-center gap-2 bg-interactive px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-interactive/90"
                >
                  Send enquiry
                  <ArrowRight size={15} />
                </a>
                {branches.map((branch) => (
                  <a
                    key={branch.city}
                    href={`tel:${branch.salesPhone}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/32 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:border-interactive hover:text-interactive"
                  >
                    Call {branch.city}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-grid/40 bg-background">
          <div className="container mx-auto grid gap-6 px-10 py-8 lg:grid-cols-2">
            {branches.map((branch) => (
              <article key={branch.city} className="border border-grid/30 bg-card/60 p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">Sales and showroom</p>
                    <h2 className="mt-3 font-serif text-3xl text-foreground">{branch.city}</h2>
                  </div>
                  <Building2 className="mt-1 h-5 w-5 text-heritage" />
                </div>
                <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <a href={`tel:${branch.salesPhone}`} className="group flex items-center gap-3 border-t border-grid/30 pt-3 hover:text-interactive">
                    <Phone className="h-4 w-4 text-heritage" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em]">Call {branch.city}</p>
                      <p className="mt-1 text-foreground">{branch.phones[1]}</p>
                    </div>
                  </a>
                  <a
                    href={`https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(`Hello Regal Office & Home ${branch.city}, I would like help with a furniture enquiry.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 border-t border-grid/30 pt-3 hover:text-interactive"
                  >
                    <MessageSquare className="h-4 w-4 text-heritage" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em]">WhatsApp {branch.city}</p>
                      <p className="mt-1 text-foreground">{branch.phones[1]}</p>
                    </div>
                  </a>
                  <a href={`mailto:${branch.email}?subject=${encodeURIComponent(`${branch.city} furniture enquiry`)}`} className="group flex items-center gap-3 border-t border-grid/30 pt-3 hover:text-interactive">
                    <Mail className="h-4 w-4 text-heritage" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em]">Email {branch.city}</p>
                      <p className="mt-1 text-foreground">{branch.email}</p>
                    </div>
                  </a>
                  <a href="#branches" className="group flex items-center gap-3 border-t border-grid/30 pt-3 hover:text-interactive">
                    <MapPin className="h-4 w-4 text-heritage" />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em]">{branch.city} address</p>
                      <p className="mt-1 text-foreground">{branch.address}</p>
                    </div>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="enquiry" className="bg-background py-20 md:py-24">
          <div className="container mx-auto grid gap-12 px-10 xl:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Project desk</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
                Give the team enough context to respond with the right next move.
              </h2>
              <div className="mt-8 overflow-hidden bg-card">
                <img
                  src={productWorkstation}
                  alt="Workstation furniture planning"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 border border-grid/25 bg-card/70 p-5 md:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" placeholder="+263..." />
                </div>
                <div className="space-y-2">
                  <Label>Preferred warehouse</Label>
                  <Select name="warehouse" defaultValue="Harare">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Harare">Harare</SelectItem>
                      <SelectItem value="Bulawayo">Bulawayo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Enquiry type</Label>
                <Select name="enquiryType" defaultValue={enquiryTypes[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {enquiryTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={7}
                  placeholder="Tell us what you are furnishing, quantities, preferred dates, finishes, or any catalogue product names."
                  required
                />
              </div>
              <div className="flex flex-col gap-4 border-t border-grid/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted-foreground">
                  This opens your email app with the enquiry prepared for Regal.
                </p>
                <Button type="submit" className="min-h-12 rounded-none px-6 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <Send className="h-4 w-4" />
                  Send message
                </Button>
              </div>
            </form>
          </div>
        </section>

        <section className="surface-inverse py-20 md:py-24">
          <div className="container mx-auto px-10">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.62)]">How enquiries move</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-[rgb(var(--inverse-foreground-rgb)/1)] md:text-5xl">
                  From first message to a practical furniture route.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-8 text-[rgb(var(--inverse-foreground-rgb)/0.68)] lg:justify-self-end">
                Whether the need is a single chair, a boardroom, a school, a hotel, or a full office floor, the response starts with clarity around use, fit, and timing.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {processSteps.map((step, index) => (
                <div key={step.title} className="border border-[rgb(var(--inverse-foreground-rgb)/0.16)] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-interactive">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 font-serif text-3xl leading-tight text-[rgb(var(--inverse-foreground-rgb)/1)]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[rgb(var(--inverse-foreground-rgb)/0.68)]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="branches" className="bg-background py-20 md:py-24">
          <div className="container mx-auto grid gap-12 px-10 xl:grid-cols-[0.52fr_0.48fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Branches</p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
                Two city touchpoints for showroom help, procurement, and delivery planning.
              </h2>

              <div className="mt-10 grid gap-5">
                {branches.map((branch) => (
                  <div key={branch.city} className="grid gap-5 border border-grid/30 bg-card/50 p-6 md:grid-cols-[0.26fr_0.74fr]">
                    <div>
                      <p className="font-serif text-3xl text-foreground">{branch.city}</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-label">{branch.note}</p>
                    </div>
                    <div className="grid gap-4 text-sm leading-7 text-muted-foreground">
                      <p className="flex gap-3">
                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-heritage" />
                        <span>{branch.address}</span>
                      </p>
                      <p className="flex gap-3">
                        <Phone className="mt-1 h-4 w-4 shrink-0 text-heritage" />
                        <span className="grid gap-1">
                          {branch.phones.map((phone) => (
                            <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-interactive">{phone}</a>
                          ))}
                        </span>
                      </p>
                      <p className="flex gap-3">
                        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-heritage" />
                        <a href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-interactive">
                          WhatsApp {branch.city}: {branch.phones[1]}
                        </a>
                      </p>
                      <p className="flex gap-3">
                        <Mail className="mt-1 h-4 w-4 shrink-0 text-heritage" />
                        <a href={`mailto:${branch.email}?subject=${encodeURIComponent(`${branch.city} furniture enquiry`)}`} className="hover:text-interactive">
                          {branch.email}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="overflow-hidden border border-grid/25 bg-card">
                <div className="border-b border-grid/25 px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">Google Maps</p>
                  <h3 className="mt-2 font-serif text-2xl text-foreground">Warehouse locations</h3>
                </div>
                <div className="grid divide-y divide-grid/25">
                  {branches.map((branch) => (
                    <article key={`${branch.city}-map`} className="grid bg-card md:grid-cols-[0.42fr_0.58fr] xl:grid-cols-1 2xl:grid-cols-[0.42fr_0.58fr]">
                      <div className="flex flex-col justify-between gap-4 p-5">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">{branch.city}</p>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{branch.address}</p>
                        </div>
                        <a
                          href={googleMapsSearchUrl(branch.mapQuery)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-heritage transition-colors hover:text-interactive"
                        >
                          Open in Google Maps
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <iframe
                        title={`${branch.city} Regal warehouse location on Google Maps`}
                        src={googleMapsEmbedUrl(branch.mapQuery)}
                        className="min-h-[260px] w-full border-0 md:h-full xl:h-[280px] 2xl:h-full"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </article>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="border border-grid/25 bg-card/70 p-5">
                  <Clock className="h-5 w-5 text-heritage" />
                  <h3 className="mt-4 font-serif text-2xl text-foreground">Visit planning</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Call ahead for availability, product matching, and large-order support.
                  </p>
                </div>
                <div className="border border-grid/25 bg-card/70 p-5">
                  <Truck className="h-5 w-5 text-heritage" />
                  <h3 className="mt-4 font-serif text-2xl text-foreground">Delivery notes</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Share site access, city, quantities, and installation needs with the enquiry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-grid/40 bg-[rgb(var(--secondary)/0.48)] py-16">
          <div className="container mx-auto grid gap-8 px-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
            <div className="overflow-hidden bg-card">
              <img
                src={productConference}
                alt="Conference furniture detail"
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Ready when you are</p>
              <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
                Bring the product name, the room plan, or just the problem. Regal can help turn it into a furniture direction.
              </h2>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Contact;
