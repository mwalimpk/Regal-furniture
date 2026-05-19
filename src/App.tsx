import { Component, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AdminRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ClientDashboard from "./pages/ClientDashboard";
import Categories from "./pages/Categories";
import Catalogue from "./pages/Catalogue";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-6">
          <div className="max-w-2xl rounded-[28px] border border-[#e6ddd1] bg-white p-8 shadow-[0_20px_50px_rgba(23,26,24,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c8274] mb-3">Runtime Error</p>
            <h1 className="font-serif text-3xl text-[#171a18] mb-4">The app hit an error while rendering.</h1>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[#5f584f]">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
              <CartDrawer />
              <WhatsAppFloat />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/catalogue" element={<Catalogue />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
