import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/AppLayout";
import Welcome from "@/pages/Welcome";
import Generate from "@/pages/Generate";
import Gallery from "@/pages/Gallery";
import { AuthProvider } from "@/providers/AuthProvider";
import { useEffect } from "react";
import logo from "@/assets/logo.png";

const queryClient = new QueryClient();

const Favicon = () => {
  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const link = existing ?? document.createElement("link");

    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "32x32";
    link.href = logo;

    if (!existing) {
      document.head.appendChild(link);
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Favicon />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Welcome />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/gallery" element={<Gallery />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
