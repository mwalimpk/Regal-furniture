import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import regalLogo from "@/assets/regal-logo-homepage.png";
import OrderFormDialog from "@/components/OrderFormDialog";
import { categories } from "@/data/products";

type MegaMenuItem = {
  label: string;
  slug: string;
  description: string;
  spotlight: Array<{
    title: string;
    image: string;
    href: string;
  }>;
};

const menuItems: MegaMenuItem[] = [
  {
    label: "Seating",
    slug: "executive-chairs",
    description: "Executive, ergonomic, and visitor seating for workspaces that need comfort and authority.",
    spotlight: [
      {
        title: "Executive chairs with premium finishes",
        image: "/images/products/green/BIG AND TALL HIGH BACK SWIVEL CHAIR.jpg",
        href: "/category/executive-chairs",
      },
      {
        title: "Ergonomic seating for daily workstation use",
        image: "/images/products/green/AQUA ERGONOMIC SWIVEL CHAIR.jpg",
        href: "/category/ergonomic-chairs",
      },
    ],
  },
  {
    label: "Desks & Tables",
    slug: "executive-desking",
    description: "Executive desks, meeting tables, and height-adjustable work surfaces for focused work.",
    spotlight: [
      {
        title: "Height-adjustable desks for dynamic teams",
        image: "/images/products/green/HILO 200 STANDING DESK.jpg",
        href: "/category/adjustable-desking",
      },
      {
        title: "Executive desks built for statement offices",
        image: "/images/products/green/KARINA L SHAPED DESK.jpg",
        href: "/category/executive-desking",
      },
    ],
  },
  {
    label: "Workplace",
    slug: "workstations",
    description: "Shared workstations, planning tables, and layout-ready furniture for productive office floors.",
    spotlight: [
      {
        title: "Workstation systems for growing teams",
        image: "/images/products/green/DOMINION 4 SEATER WORKSTATION.jpg",
        href: "/category/workstations",
      },
      {
        title: "Boardroom-ready meeting settings",
        image: "/images/products/green/ARCADIAN BOARDROOM TABLE.jpg",
        href: "/category/conference-tables",
      },
    ],
  },
  {
    label: "Accessories & Storage",
    slug: "storage-filing",
    description: "Storage, filing, reception accessories, and support furniture that complete the room.",
    spotlight: [
      {
        title: "Storage that keeps operations tidy",
        image: "/images/products/green/METAL 4 DRAWER FILING CABINET WTH BAR.jpg",
        href: "/category/storage-filing",
      },
      {
        title: "Reception and lounge accessories",
        image: "/images/products/green/CHESTERFIELD LEATHER COUCH 1 SEATER.jpg",
        href: "/category/accessories",
      },
    ],
  },
];

const utilityLinks = [
  { label: "New Arrivals", href: "/categories" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Sustainability", href: "/category/storage-filing" },
  { label: "Ergonomics", href: "/category/ergonomic-chairs" },
  { label: "Articles", href: "/categories" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemCount, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuLookup = useMemo(
    () =>
      menuItems.map((item) => ({
        ...item,
        category: categories.find((category) => category.slug === item.slug),
        relatedCategories: categories
          .filter((category) =>
            category.slug === item.slug ||
            category.slug.includes(item.slug.split("-")[0]) ||
            (item.slug === "executive-chairs" && ["ergonomic-chairs", "visitor-chairs"].includes(category.slug)) ||
            (item.slug === "executive-desking" && ["managerial-desking", "adjustable-desking", "l-shaped-desks"].includes(category.slug)) ||
            (item.slug === "workstations" && ["conference-tables"].includes(category.slug)) ||
            (item.slug === "storage-filing" && ["accessories", "sofas-lounge"].includes(category.slug))
          )
          .slice(0, 7),
      })),
    [],
  );

  const activeMenu = menuLookup.find((item) => item.label === openMenu) || null;

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50">
        <div
          className={`border-b border-black/5 bg-[rgba(255,255,255,0.96)] backdrop-blur-lg transition-all duration-300 ${
            isScrolled ? "shadow-[0_14px_40px_rgba(21,24,22,0.08)]" : ""
          }`}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <div className="container mx-auto hidden px-6 lg:block">
            <div className="grid grid-cols-[220px_1fr_220px] items-center gap-6 border-b border-[#ece6db] py-4">
              <div className="flex items-center border-b border-[#c9c0b4] pb-2 text-sm text-[#7a7267]">
                <Search size={16} className="mr-2 text-[#45413a]" />
                <span>Search collections</span>
              </div>

              <div className="flex justify-center">
                <Link to="/" className="inline-flex items-center">
                  <img src={regalLogo} alt="Regal Office & Home" className="h-14 w-auto object-contain" />
                </Link>
              </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                to="/admin"
                className="text-sm font-semibold text-[#2e2a25] transition-colors hover:text-brand-red"
              >
                Admin
              </Link>

              {user ? (
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                    className="text-sm font-medium text-[#2e2a25] transition-colors hover:text-brand-red"
                  >
                    {profile?.full_name?.split(" ")[0] || "Account"}
                  </Link>
                ) : (
                  <Link to="/auth" className="text-[#2e2a25] transition-colors hover:text-brand-red">
                    <User size={19} />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="relative text-[#2e2a25] transition-colors hover:text-brand-red"
                >
                  <ShoppingCart size={19} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 py-3 text-sm text-[#3a3630]">
              {utilityLinks.map((link) => (
                <Link key={link.label} to={link.href} className="transition-colors hover:text-brand-red">
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setOrderOpen(true)}
                className="rounded-full border border-[#d9cfbf] px-4 py-2 text-sm font-semibold text-[#221f1b] transition-colors hover:border-brand-red hover:text-brand-red"
              >
                Quick Order
              </button>
            </div>
          </div>

          <div className="hidden border-t border-[#ece6db] lg:block">
            <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-6">
              <div />

              <div className="flex items-center justify-center gap-8">
                {menuLookup.map((item) => (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setOpenMenu(item.label)}
                      className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                        openMenu === item.label
                          ? "border-[#25211d] text-[#1e1a17]"
                          : "border-transparent text-[#37332e] hover:text-brand-red"
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div />
            </div>
          </div>

          {activeMenu && (
            <div className="hidden border-t border-[#ece6db] bg-[#fcfaf6] lg:block">
              <div className="container mx-auto grid grid-cols-[280px_1fr] gap-10 px-6 py-6">
                <div className="pr-2">
                  <Link to={`/category/${activeMenu.slug}`} className="block">
                    <h3 className="font-serif text-3xl text-[#171a18] hover:text-brand-red">
                      Shop All {activeMenu.label}
                    </h3>
                  </Link>
                  <p className="mt-3 text-sm leading-7 text-[#61584e]">{activeMenu.description}</p>

                  <div className="mt-6 space-y-3">
                    {activeMenu.relatedCategories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className="block text-base text-[#2d2823] transition-colors hover:text-brand-red"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {activeMenu.spotlight.map((spot) => (
                    <Link key={spot.title} to={spot.href} className="group block">
                      <div className="overflow-hidden bg-[#efe6d8]">
                        <img
                          src={spot.image}
                          alt={spot.title}
                          className="h-[260px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-3 text-base font-semibold text-[#1f1c18] transition-colors group-hover:text-brand-red">
                        {spot.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-4 lg:hidden">
            <button className="rounded-full p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="inline-flex items-center">
              <img src={regalLogo} alt="Regal Office & Home" className="h-12 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsOpen(true)} className="relative text-[#2e2a25]">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <Link to={user ? (isAdmin ? "/admin" : "/dashboard") : "/auth"} className="text-[#2e2a25]">
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#e8dfd4] bg-[#fcfaf7] p-5 shadow-xl lg:hidden">
            <div className="mb-4 flex items-center border-b border-[#d3c8b7] pb-2 text-sm text-[#7a7267]">
              <Search size={16} className="mr-2 text-[#45413a]" />
              <span>Search collections</span>
            </div>

            <div className="flex flex-col gap-3">
              {menuLookup.map((item) => (
                <Link
                  key={item.label}
                  to={`/category/${item.slug}`}
                  className="rounded-2xl border border-[#ece4d8] px-4 py-3 text-sm font-medium text-[#26231f]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {utilityLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="rounded-2xl border border-[#ece4d8] px-4 py-3 text-sm text-[#4a443d]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setOrderOpen(true);
                  setMobileOpen(false);
                }}
                className="rounded-2xl bg-[#ede4d7] px-4 py-3 text-sm font-semibold text-[#1a1f1b]"
              >
                Quick Order
              </button>
              <div className="border-t border-[#ece4d8] pt-3">
                {!user ? (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button className="h-12 w-full rounded-full bg-[#7b1f34] text-white">Sign in</Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    variant="outline"
                    className="h-12 w-full rounded-full border-brand-red text-brand-red"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <OrderFormDialog open={orderOpen} onOpenChange={setOrderOpen} />
    </>
  );
};

export default Navbar;
