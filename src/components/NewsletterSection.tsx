import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsletterSection = () => {
  return (
    <section className="border-t border-grid/50 bg-[linear-gradient(180deg,rgb(var(--secondary)/0.42)_0%,rgb(var(--background)/1)_100%)] py-20">
      <div className="container mx-auto px-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">Stay Informed</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground md:text-5xl">
            Receive new arrivals, project stories, and quieter product updates worth opening.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            We’ll keep it relevant: new collections, availability updates, and practical inspiration for better workspaces.
          </p>

          <form className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 bg-card/75 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-label">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-label"
                required
              />
            </div>
            <Button
              type="submit"
              className="rounded-none bg-heritage px-6 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-heritage/90"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
