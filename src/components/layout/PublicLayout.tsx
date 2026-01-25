import { ReactNode } from "react";
import { PublicNavbar } from "./PublicNavbar";

interface PublicLayoutProps {
	children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<PublicNavbar />
			<main className="flex-1">{children}</main>

			{/* Optional Footer */}
			<footer className="border-t bg-muted/50 py-6">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-center text-sm text-muted-foreground">
							© 2026 BinSync. Smart Waste Management System.
						</p>
						<div className="flex gap-4">
							<a
								href="#"
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								About
							</a>
							<a
								href="#"
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								Contact
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
