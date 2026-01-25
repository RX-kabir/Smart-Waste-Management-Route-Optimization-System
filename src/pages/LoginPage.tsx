import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const success = await login(email, password);
			if (success) {
				// Redirect based on role
				if (email.includes("admin")) {
					navigate("/admin/dashboard");
				} else if (email.includes("driver")) {
					navigate("/driver/dashboard");
				} else {
					navigate("/admin/dashboard");
				}
			} else {
				setError("Invalid email or password");
			}
		} catch (err) {
			setError("An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
			<div className="w-full max-w-md space-y-6">
				{/* Logo/Branding */}
				<div className="flex flex-col items-center space-y-2">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
						<Leaf className="h-10 w-10" />
					</div>
					<h1 className="font-display text-2xl font-bold">BinSync</h1>
					<p className="text-sm text-muted-foreground">Smart Waste Management</p>
				</div>

				{/* Login Card */}
				<Card>
					<CardHeader>
						<CardTitle className="font-display">Staff Login</CardTitle>
						<CardDescription>
							Enter your credentials to access the admin or driver dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@ecowaste.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Logging in..." : "Login"}
							</Button>
						</form>

						{/* Demo Credentials */}
						<div className="mt-6 rounded-lg bg-muted p-4">
							<p className="text-sm font-medium mb-2">Demo Credentials:</p>
							<div className="space-y-1 text-xs text-muted-foreground">
								<p>Admin: admin@ecowaste.com</p>
								<p>Driver: driver@ecowaste.com</p>
								<p className="text-[10px] mt-2">Password: any</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Back to Public Dashboard */}
				<div className="text-center">
					<Link
						to="/"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						← Back to Public Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
