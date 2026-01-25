import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Public Pages
import PublicDashboard from "./pages/public/PublicDashboard";
import PublicMapPage from "./pages/public/PublicMapPage";
import LoginPage from "./pages/LoginPage";

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
						{/* Public Routes */}
						<Route path="/" element={<PublicDashboard />} />
						<Route path="/map" element={<PublicMapPage />} />
						<Route path="/login" element={<LoginPage />} />

						{/* Protected Admin Routes */}
						<Route
							path="/admin/dashboard"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/map"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminMapPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/bins"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminBinsPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/zones"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminZonesPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/routes"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminRoutesPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/trucks"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminTrucksPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/drivers"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminDriversPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/analytics"
							element={
								<ProtectedRoute requiredRole="admin">
									<AdminAnalyticsPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/analytics"
							element={
								<ProtectedRoute>
									<AnalyticsPage />
								</ProtectedRoute>
							}
						/>

						{/* 404 */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
