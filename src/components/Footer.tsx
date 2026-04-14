const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-3">Power of Circles</h3>
            <p className="text-sm opacity-80">
              Transforming networks into opportunities through intentional circles of trust and collaboration.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {["Home", "Properties", "About Us", "What We Do", "Contact"].map((link) => (
                <li key={link}><a href="#" className="hover:opacity-100 transition-opacity">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-sm opacity-80">info@powerofcircles.com</p>
            <p className="text-sm opacity-80 mt-1">Nairobi, Kenya</p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-70">
          © {new Date().getFullYear()} Power of Circles. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
