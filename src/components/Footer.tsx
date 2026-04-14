const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-xl font-semibold mb-2">Regal Office & Home</h3>
            <p className="text-xs md:text-sm opacity-80">
              A legacy of comfort. Premium furniture for office and home since 2021.
            </p>
            <p className="text-xs opacity-70 mt-2">www.regalfurn.co.zw</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Products</h4>
            <ul className="space-y-1.5 text-xs opacity-80">
              {["Executive Desks", "Office Chairs", "Workstations", "Conference Tables", "Home Furniture", "Storage"].map((link) => (
                <li key={link}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Company</h4>
            <ul className="space-y-1.5 text-xs opacity-80">
              {["About Us", "Our Team", "Catalogue", "Corporate Orders", "Careers"].map((link) => (
                <li key={link}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Contact</h4>
            <div className="space-y-1.5 text-xs opacity-80">
              <p>📍 DDK Centre 68, Enterprise Rd, Newlands, Harare</p>
              <p>📍 Norvaal House, 68 Fife Street, Bulawayo</p>
              <p>📞 +263 8644 281 361</p>
              <p>📞 +263 780 472 180</p>
              <p>✉ info@regalfurn.co.zw</p>
              <div className="flex gap-3 pt-2">
                <a href="#" className="hover:opacity-100">Facebook</a>
                <a href="#" className="hover:opacity-100">Twitter</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center text-xs opacity-70">
          © {new Date().getFullYear()} Regal Office & Home. All rights reserved. | @RegalOfficeHome
        </div>
      </div>
    </footer>
  );
};

export default Footer;
