import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import regalLogo from "@/assets/regal-logo-homepage.png";
import OrderFormDialog from "@/components/OrderFormDialog";
import ThemeToggle from "@/components/ThemeToggle";
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
];

const desktopUtilityLinkClass =
  "relative px-4 py-3 text-base text-[rgb(var(--nav-ink-rgb)/0.92)] transition-colors duration-150 ease-linear hover:text-interactive";
const mobileListLinkClass =
  "flex items-center justify-between px-4 py-4 text-sm text-[rgb(var(--nav-ink-rgb)/0.92)] transition-colors duration-150 ease-linear hover:text-interactive";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemCount, setIsOpen } = useCart();

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
            (item.slug === "executive-desking" &&
              ["managerial-desking", "adjustable-desking", "l-shaped-desks"].includes(category.slug)) ||
            (item.slug === "workstations" && ["conference-tables"].includes(category.slug)) ||
            (item.slug === "storage-filing" && ["accessories", "sofas-lounge"].includes(category.slug))
          )
          .slice(0, 7),
      })),
    [],
  );

  const activeMenu = menuLookup.find((item) => item.label === openMenu) || null;
  const accountHref = user ? (isAdmin ? "/admin" : "/dashboard") : "/auth";
  const accountLabel = user ? `${profile?.full_name?.split(" ")[0] || "Account"} account` : "Account";

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-t border-heritage bg-[rgb(var(--nav-surface-rgb)/0.96)] text-[rgb(var(--nav-ink-rgb)/1)] backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--nav-surface-rgb)/0.92)]">
        <div className="hidden lg:block" onMouseLeave={() => setOpenMenu(null)}>
          <div className="border-b border-[rgb(var(--nav-divider-rgb)/1)]">
            <div className="mx-auto grid max-w-7xl grid-cols-12 items-center gap-5 px-[40px] py-3">
              <div className="col-span-4">
                <button
                  type="button"
                  className="group flex w-full max-w-[240px] items-center justify-between border-b border-[rgb(var(--nav-line-rgb)/0.55)] pb-1.5 text-left text-sm text-[rgb(var(--nav-muted-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                >
                  <span>Search</span>
                  <Search
                    size={18}
                    className="text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear group-hover:text-interactive"
                  />
                </button>
              </div>

              <div className="col-span-4 flex justify-center">
                <Link to="/" className="inline-flex items-center">
                  <img src={regalLogo} alt="Regal Office & Home" className="h-10 w-auto object-contain" />
                </Link>
              </div>

              <div className="col-span-4 flex items-center justify-end gap-2 xl:gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--nav-muted-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  >
                    // Admin
                  </Link>
                )}

                <ThemeToggle
                  className="h-9 w-9 rounded-none border-0 bg-transparent text-[rgb(var(--nav-ink-rgb)/1)] hover:border-0 hover:bg-transparent hover:text-interactive"
                />

                <Link
                  to={accountHref}
                  className="inline-flex h-9 w-9 items-center justify-center text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  aria-label={accountLabel}
                >
                  <User size={20} />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="relative inline-flex h-9 w-9 items-center justify-center text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  aria-label="Open cart"
                >
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute right-0 top-0 flex min-w-[1.1rem] items-center justify-center border border-heritage bg-heritage px-1 py-[1px] font-mono text-[9px] uppercase tracking-[0.16em] text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-[rgb(var(--nav-divider-rgb)/1)]">
            <div className="mx-auto max-w-7xl px-10">
              <div className="flex min-h-[52px] items-center justify-center">
                <div className="flex items-center gap-2">
                  {utilityLinks.map((link) => (
                    <Link key={link.label} to={link.href} className={desktopUtilityLinkClass}>
                      {link.label}
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => setOrderOpen(true)}
                    className="px-4 py-3 text-base text-heritage transition-colors duration-150 ease-linear hover:text-interactive"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`${activeMenu ? "" : "border-b border-[rgb(var(--nav-divider-rgb)/1)]"}`}>
            <div className="mx-auto max-w-7xl px-10">
              <div className="grid grid-cols-4">
                {menuLookup.map((item) => {
                  const isActive = openMenu === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onMouseEnter={() => setOpenMenu(item.label)}
                      className={`group relative flex min-h-[56px] items-center justify-center gap-2 px-4 py-4 text-base transition-colors duration-150 ease-linear ${
                        isActive ? "text-[rgb(var(--nav-ink-rgb)/1)]" : "text-[rgb(var(--nav-ink-rgb)/1)] hover:text-interactive"
                      }`}
                    >
                      <span
                        className={`absolute inset-x-6 bottom-0 transition-all duration-150 ease-linear ${
                          isActive ? "h-[2px] bg-heritage" : "h-px bg-transparent group-hover:bg-heritage"
                        }`}
                      />
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-colors duration-150 ease-linear ${
                          isActive ? "text-[rgb(var(--nav-ink-rgb)/1)]" : "text-[rgb(var(--nav-ink-rgb)/1)] group-hover:text-interactive"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {activeMenu && (
            <div className="border-b border-[rgb(var(--nav-divider-rgb)/1)] bg-[rgb(var(--nav-surface-rgb)/0.98)]">
              <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-10 py-8">
                <div className="col-span-4 border-r border-[rgb(var(--nav-divider-rgb)/1)] pr-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-muted-rgb)/1)]">// {activeMenu.label}</p>
                  <Link
                    to={`/category/${activeMenu.slug}`}
                    className="mt-4 block font-serif text-3xl leading-none text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  >
                    Shop All {activeMenu.label}
                  </Link>
                  <p className="mt-4 text-sm leading-7 text-[rgb(var(--nav-ink-rgb)/0.7)]">{activeMenu.description}</p>

                  <div className="mt-6 flex flex-col">
                    {activeMenu.relatedCategories.map((category, index) => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className={`py-3 text-sm text-[rgb(var(--nav-ink-rgb)/0.92)] transition-colors duration-150 ease-linear hover:text-interactive ${
                          index > 0 ? "border-t border-[rgb(var(--nav-divider-rgb)/1)]" : ""
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="col-span-8 grid grid-cols-2 gap-6">
                  {activeMenu.spotlight.map((spot) => (
                    <Link key={spot.title} to={spot.href} className="group block">
                      <div className="overflow-hidden border border-[rgb(var(--nav-divider-rgb)/1)] bg-[rgb(var(--nav-elevated-rgb)/1)]">
                        <img
                          src={spot.image}
                          alt={spot.title}
                          className="h-[240px] w-full object-cover transition-transform duration-300 ease-linear group-hover:scale-[1.02]"
                        />
                      </div>
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-muted-rgb)/1)]">// Feature</p>
                      <p className="mt-2 text-base text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear group-hover:text-interactive">
                        {spot.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-[rgb(var(--nav-divider-rgb)/1)] lg:hidden">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex min-h-[76px] items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center border border-[rgb(var(--nav-divider-rgb)/1)] text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link to="/" className="inline-flex items-center">
                <img src={regalLogo} alt="Regal Office & Home" className="h-11 w-auto object-contain" />
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle
                  className="h-10 w-10 rounded-none border border-[rgb(var(--nav-divider-rgb)/1)] bg-transparent text-[rgb(var(--nav-ink-rgb)/1)] hover:border-[rgb(var(--nav-divider-rgb)/1)] hover:bg-transparent hover:text-interactive"
                />

                <Link
                  to={accountHref}
                  className="inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--nav-divider-rgb)/1)] text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  aria-label={accountLabel}
                >
                  <User size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="relative inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--nav-divider-rgb)/1)] text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  aria-label="Open cart"
                >
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span className="absolute right-0 top-0 flex min-w-[1rem] items-center justify-center border border-heritage bg-heritage px-1 py-[1px] font-mono text-[8px] uppercase tracking-[0.12em] text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-b border-[rgb(var(--nav-divider-rgb)/1)] bg-[rgb(var(--nav-surface-rgb)/0.98)] lg:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <button
                type="button"
                className="group flex w-full items-center justify-between border-b border-[rgb(var(--nav-line-rgb)/0.55)] pb-2 text-left text-[16px] text-[rgb(var(--nav-muted-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
              >
                <span>Search</span>
                <Search
                  size={20}
                  className="text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear group-hover:text-interactive"
                />
              </button>

              <div className="mt-4 divide-y divide-[rgb(var(--nav-divider-rgb)/1)] border border-[rgb(var(--nav-divider-rgb)/1)]">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={mobileListLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}

                  <button
                    type="button"
                    onClick={() => {
                      setOrderOpen(true);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left text-sm text-heritage transition-colors duration-150 ease-linear hover:text-interactive"
                  >
                    <span>Quick Order</span>
                  </button>
              </div>

              <div className="mt-4 divide-y divide-[rgb(var(--nav-divider-rgb)/1)] border border-[rgb(var(--nav-divider-rgb)/1)]">
                {menuLookup.map((item) => (
                  <Link
                    key={item.label}
                    to={`/category/${item.slug}`}
                    className={mobileListLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="font-mono uppercase tracking-[0.2em]">{item.label}</span>
                    <ChevronDown size={16} className="text-[rgb(var(--nav-ink-rgb)/1)]" />
                  </Link>
                ))}
              </div>

              <div className="mt-4">
                {!user ? (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="block">
                    <Button className="h-12 w-full rounded-none border border-[rgb(var(--nav-ink-rgb)/1)] bg-transparent font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-ink-rgb)/1)] hover:border-interactive hover:bg-transparent hover:text-interactive">
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    variant="outline"
                    className="h-12 w-full rounded-none border-[rgb(var(--nav-ink-rgb)/1)] bg-transparent font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-ink-rgb)/1)] hover:border-interactive hover:bg-transparent hover:text-interactive"
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
