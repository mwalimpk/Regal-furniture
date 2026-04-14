const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-3 tracking-wider uppercase">Haworth</h3>
            <p className="text-sm opacity-80">
              Creating beautiful, functional workspaces that inspire productivity and well-being.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {["Seating", "Desks & Tables", "Gaming", "Lighting", "Accessories", "Outdoor"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:opacity-100 transition-opacity">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {["About Us", "Sustainability", "Ergonomics", "Articles", "Careers"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:opacity-100 transition-opacity">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase">Support</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {["Contact Us", "FAQ", "Shipping & Returns", "Warranty", "Assembly"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:opacity-100 transition-opacity">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-70">
          © {new Date().getFullYear()} Haworth. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
