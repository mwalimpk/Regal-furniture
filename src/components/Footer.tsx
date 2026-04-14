const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-2xl font-bold mb-3 uppercase tracking-wide">Regal</h3>
            <p className="text-xs opacity-60 uppercase tracking-widest mb-3">Office & Home</p>
            <p className="text-sm opacity-70">
              A legacy of comfort. Premium furniture for office and home.
            </p>
            <p className="text-xs opacity-50 mt-2">www.regalfurn.co.zw</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest">Products</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {["Seating", "Desks & Tables", "Workstations", "Conference", "Storage", "Sofas & Lounge"].map((link) => (
                <li key={link}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {["About Us", "Our Team", "Catalogue", "Sustainability", "Corporate Orders"].map((link) => (
                <li key={link}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest">Contact</h4>
            <div className="space-y-2 text-sm opacity-70">
              <p>DDK Centre 68, Enterprise Rd</p>
              <p>Newlands, Harare</p>
              <p className="pt-1">Norvaal House, 68 Fife St</p>
              <p>Bulawayo</p>
              <p className="pt-1">+263 8644 281 361</p>
              <p>info@regalfurn.co.zw</p>
            </div>
          </div>
        </div>
        <div className="border-t border-background/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs opacity-50">
          <span>© {new Date().getFullYear()} Regal Office & Home. All rights reserved.</span>
          <span className="mt-2 md:mt-0">@RegalOfficeHome</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
