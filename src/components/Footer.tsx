import { Link } from "react-router-dom";
import regalLogo from "@/assets/regal-logo-brand.svg";

const Footer = () => {
  return (
    <footer className="border-t-[8px] border-brand-green bg-brand-green pb-8 pt-16 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="inline-block rounded-2xl bg-white p-3">
              <img src={regalLogo} alt="Regal Office & Home" className="h-10 object-contain" />
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-white/60">
              Quality office and home furniture.
              <br />
              Harare & Bulawayo.
            </p>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-4 text-xs text-white/70">
              <li><Link to="/about" className="transition-colors hover:text-white">About Us</Link></li>
              <li><Link to="/catalogue" className="transition-colors hover:text-white">Download Catalogue</Link></li>
              <li><Link to="/careers" className="transition-colors hover:text-white">Career</Link></li>
              <li><Link to="/policy" className="transition-colors hover:text-white">Partnership & Policy</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-semibold text-white">Categories</h4>
            <ul className="space-y-4 text-xs text-white/70">
              <li><Link to="/category/executive-chairs" className="transition-colors hover:text-white">Office Chairs</Link></li>
              <li><Link to="/category/executive-desking" className="transition-colors hover:text-white">Desks & Workstations</Link></li>
              <li><Link to="/category/conference-tables" className="transition-colors hover:text-white">Conference Tables</Link></li>
              <li><Link to="/category/sofas-lounge" className="transition-colors hover:text-white">Lounge & Reception</Link></li>
              <li><Link to="/category/storage-filing" className="transition-colors hover:text-white">Storage Solutions</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-semibold text-white">Help</h4>
            <ul className="space-y-4 text-xs text-white/70">
              <li><Link to="/payments" className="transition-colors hover:text-white">Payments</Link></li>
              <li><Link to="/shipping" className="transition-colors hover:text-white">Shipping</Link></li>
              <li><Link to="/returns" className="transition-colors hover:text-white">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-white">FAQs</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-6 font-semibold text-white">Connect with Us</h4>
            <ul className="space-y-4 text-xs text-white/70">
              <li><a href="#" className="transition-colors hover:text-white">Facebook</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Twitter</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Instagram</a></li>
              <li><a href="#" className="transition-colors hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[11px] text-white/50 md:flex-row">
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms and Conditions</Link>
            <Link to="/policy" className="transition-colors hover:text-white">Return Policy</Link>
          </div>
          <div>Copyright 2026 Regal Office Home. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
