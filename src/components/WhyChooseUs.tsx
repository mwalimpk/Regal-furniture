const features = [
  { title: "Premium Quality", description: "Handcrafted furniture built with the finest materials to stand the test of time." },
  { title: "Nationwide Delivery", description: "Free delivery across Zimbabwe. International shipping available on request." },
  { title: "2 Year Warranty", description: "Every piece comes with a comprehensive 2-year manufacturer warranty." },
  { title: "Expert Support", description: "Dedicated team to help you choose the perfect furniture for your space." },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Why Regal?</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Decades of experience combining modern aesthetics with exceptional craftsmanship.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background text-center p-6 md:p-10">
              <h3 className="font-serif text-sm md:text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
