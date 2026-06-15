import { Link } from "react-router-dom";
import { useProductCategories } from "@/hooks/useProductCategories";
import regalLogo from "@/assets/regal-logo-brand.svg";

const Footer = () => {
  const { data: categories = [] } = useProductCategories();

  return (
    <footer className="border-t border-grid bg-card pb-8 pt-16 text-foreground">
      <div className="container mx-auto px-10">
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="surface-inverse inline-block border border-grid p-3">
              <img src={regalLogo} alt="Regal Office & Home" className="h-10 object-contain" />
            </Link>
            <p className="max-w-xs font-mono text-[11px] leading-relaxed uppercase tracking-[0.18em] text-label">
              Quality office and home furniture.
              <br />
              Harare & Bulawayo.
            </p>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-label">Quick Links</h4>
            <ul className="space-y-4 text-sm text-foreground/72">
              <li><Link to="/about" className="transition-colors hover:text-interactive">About Us</Link></li>
              <li><Link to="/catalogue" className="transition-colors hover:text-interactive">Download Catalogue</Link></li>
              <li><Link to="/careers" className="transition-colors hover:text-interactive">Career</Link></li>
              <li><Link to="/policy" className="transition-colors hover:text-interactive">Partnership & Policy</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-interactive">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-label">Categories</h4>
            <ul className="space-y-4 text-sm text-foreground/72">
              {categories.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link to={category.url} className="transition-colors hover:text-interactive">{category.name}</Link>
                </li>
              ))}
              {!categories.length && <li><Link to="/categories" className="transition-colors hover:text-interactive">Browse Categories</Link></li>}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-label">Help</h4>
            <ul className="space-y-4 text-sm text-foreground/72">
              <li><Link to="/payments" className="transition-colors hover:text-interactive">Payments</Link></li>
              <li><Link to="/shipping" className="transition-colors hover:text-interactive">Shipping</Link></li>
              <li><Link to="/returns" className="transition-colors hover:text-interactive">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-interactive">FAQs</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-label">Connect with Us</h4>
            <ul className="space-y-4 text-sm text-foreground/72">
              <li><a href="#" className="transition-colors hover:text-interactive">Facebook</a></li>
              <li><a href="#" className="transition-colors hover:text-interactive">Twitter</a></li>
              <li><a href="#" className="transition-colors hover:text-interactive">Instagram</a></li>
              <li><a href="#" className="transition-colors hover:text-interactive">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-grid pt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-label md:flex-row">
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-interactive">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-interactive">Terms and Conditions</Link>
            <Link to="/policy" className="transition-colors hover:text-interactive">Return Policy</Link>
          </div>
          <div>Copyright 2026 Regal Office Home. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
