import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="surface-elevated border border-grid/25 p-10 text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-label">404</p>
        <h1 className="mb-4 font-serif text-4xl">Page not found</h1>
        <p className="mb-6 text-base text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
        <a href="/" className="font-medium text-heritage underline transition-colors hover:text-interactive">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
