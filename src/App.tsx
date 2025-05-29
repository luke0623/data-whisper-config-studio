
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Modules from "./pages/Modules";
import Models from "./pages/Models";
import Tables from "./pages/Tables";
import Config from "./pages/Config";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <div className="sticky top-0 z-40 bg-white border-b px-4 py-2">
                <SidebarTrigger />
              </div>
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/models" element={<Models />} />
                  <Route path="/tables" element={<Tables />} />
                  <Route path="/config" element={<Config />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
