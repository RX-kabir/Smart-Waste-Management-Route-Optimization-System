import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
	const { user, isAuthenticated } = useAuth();

	// If not authenticated, redirect to login
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// If role is required and doesn't match, redirect to appropriate dashboard
	if (requiredRole && user?.role !== requiredRole) {
		if (user?.role === "admin") {
			return <Navigate to="/admin/dashboard" replace />;
		} else if (user?.role === "driver") {
			return <Navigate to="/driver/dashboard" replace />;
		}
	}

	return <>{children}</>;
}
