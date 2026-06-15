import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProductCategories } from "@/hooks/useProductCategories";
import regalLogo from "@/assets/regal-logo-homepage.png";
import OrderFormDialog from "@/components/OrderFormDialog";
import ThemeToggle from "@/components/ThemeToggle";

const utilityLinks = [
  { label: "About", href: "/about" },
  { label: "New Arrivals", href: "/categories" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Contact", href: "/contact" },
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
  const { data: categories = [] } = useProductCategories();

  const menuLookup = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        spotlight: (category.featured.length
          ? category.featured
          : [{ id: `${category.slug}-overview`, name: category.description, image_url: category.image }]
        ).slice(0, 2).map((item, index) => ({
          title: item.name,
          image: item.image_url || category.image,
          href: category.url,
          key: `${category.slug}-${item.id || index}`,
        })),
      })),
    [categories],
  );

  const activeMenu = menuLookup.find((item) => item.name === openMenu) || null;
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
                  <Search size={18} className="text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear group-hover:text-interactive" />
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

                <ThemeToggle className="h-9 w-9 rounded-none border-0 bg-transparent text-[rgb(var(--nav-ink-rgb)/1)] hover:border-0 hover:bg-transparent hover:text-interactive" />

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
              <div className="flex w-full items-stretch justify-between gap-3">
                {menuLookup.map((item) => {
                  const isActive = openMenu === item.name;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setOpenMenu(item.name)}
                      className={`group relative flex min-h-[56px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-1 py-4 text-[10px] font-bold uppercase tracking-[0.06em] transition-colors duration-150 ease-linear xl:px-2 xl:text-[11px] 2xl:text-xs ${
                        isActive ? "text-[rgb(var(--nav-ink-rgb)/1)]" : "text-[rgb(var(--nav-ink-rgb)/1)] hover:text-interactive"
                      }`}
                    >
                      <span className={`absolute inset-x-6 bottom-0 transition-all duration-150 ease-linear ${isActive ? "h-[2px] bg-heritage" : "h-px bg-transparent group-hover:bg-heritage"}`} />
                      <span>{item.name}</span>
                      <ChevronDown size={16} className="shrink-0" />
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-muted-rgb)/1)]">// {activeMenu.name}</p>
                  <Link
                    to={activeMenu.url}
                    className="mt-4 block font-serif text-3xl leading-none text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear hover:text-interactive"
                  >
                    Browse our <br />{activeMenu.name} products
                  </Link>
                  <p className="mt-4 text-sm leading-7 text-[rgb(var(--nav-ink-rgb)/0.7)]">{activeMenu.description}</p>
                </div>

                <div className="col-span-8 flex flex-nowrap gap-6 overflow-x-auto pb-4">
                  {activeMenu.spotlight.map((spot) => (
                    <Link key={spot.key} to={spot.href} className="group block w-72 shrink-0">
                      <div className="overflow-hidden border border-[rgb(var(--nav-divider-rgb)/1)] bg-[rgb(var(--nav-elevated-rgb)/1)]">
                        <img src={spot.image} alt={spot.title} className="h-[240px] w-full object-cover transition-transform duration-300 ease-linear group-hover:scale-[1.02]" />
                      </div>
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--nav-muted-rgb)/1)]">// Featured Product</p>
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
                <ThemeToggle className="h-10 w-10 rounded-none border border-[rgb(var(--nav-divider-rgb)/1)] bg-transparent text-[rgb(var(--nav-ink-rgb)/1)] hover:border-[rgb(var(--nav-divider-rgb)/1)] hover:bg-transparent hover:text-interactive" />

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
                <Search size={20} className="text-[rgb(var(--nav-ink-rgb)/1)] transition-colors duration-150 ease-linear group-hover:text-interactive" />
              </button>

              <div className="mt-4 divide-y divide-[rgb(var(--nav-divider-rgb)/1)] border border-[rgb(var(--nav-divider-rgb)/1)]">
                {utilityLinks.map((link) => (
                  <Link key={link.label} to={link.href} className={mobileListLinkClass} onClick={() => setMobileOpen(false)}>
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
                  <Link key={item.id} to={item.url} className={mobileListLinkClass} onClick={() => setMobileOpen(false)}>
                    <span className="font-mono uppercase tracking-[0.2em]">{item.name}</span>
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
