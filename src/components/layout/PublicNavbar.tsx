import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function PublicNavbar() {
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between px-4 md:px-6">
				{/* Logo/Branding */}
				<Link
					to="/"
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<Leaf className="h-6 w-6" />
					</div>
					<div className="flex flex-col">
						<span className="font-display text-lg font-bold text-foreground">
							BinSync
						</span>
						<span className="hidden text-xs text-muted-foreground sm:block">
							Smart Waste Management
						</span>
					</div>
				</Link>

				{/* Navigation Links */}
				<div className="flex items-center gap-6">
					<div className="hidden items-center gap-6 md:flex">
						<Link
							to="/"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Dashboard
						</Link>
						<Link
							to="/map"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Map
						</Link>
					</div>

					{/* Login Button */}
					<Button asChild>
						<Link to="/login">Login</Link>
					</Button>
				</div>
			</div>
		</nav>
	);
}
