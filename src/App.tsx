
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import BusinessOverview from "./pages/BusinessOverview";
import CustomerSatisfaction from "./pages/CustomerSatisfaction";
import ProductProfitability from "./pages/ProductProfitability";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // App-wide shared state could be added here or moved to context
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<BusinessOverview />} />
              <Route path="/customer-satisfaction" element={<CustomerSatisfaction />} />
              <Route path="/product-profitability" element={<ProductProfitability />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
