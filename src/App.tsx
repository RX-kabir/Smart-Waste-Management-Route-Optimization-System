import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/DashboardPage";
import AdminMapPage from "./pages/admin/MapPage";
import AdminBinsPage from "./pages/bins";
import AdminZonesPage from "./pages/admin/ZonesPage";
import AdminRoutesPage from "./pages/admin/RoutesPage";
import AdminTrucksPage from "./pages/admin/TrucksPage";
import AdminDriversPage from "./pages/admin/DriversPage";
import AdminAnalyticsPage from "./pages/admin/AnalyticsPage";
import AnalyticsPage from "./pages/analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/map" element={<AdminMapPage />} />
            <Route path="/admin/bins" element={<AdminBinsPage />} />
            <Route path="/admin/zones" element={<AdminZonesPage />} />
            <Route path="/admin/routes" element={<AdminRoutesPage />} />
            <Route path="/admin/trucks" element={<AdminTrucksPage />} />
            <Route path="/admin/drivers" element={<AdminDriversPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
