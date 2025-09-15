import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-display",
});

const notoSansTC = Noto_Sans_TC({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-body",
});

export const metadata: Metadata = {
	title:
		"Nighttangerine POS - The intuitive Point-of-Sale for small businesses",
	description:
		"Streamline your checkout process, manage inventory, and understand your customers with a modern, easy-to-use POS system.",
};

import { UserProvider } from "@auth0/nextjs-auth0/client";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${notoSansTC.variable}`}>
				<UserProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem={false}
						disableTransitionOnChange
					>
						<div className="flex flex-col min-h-screen">
							<Header />
							<main className="flex-grow">{children}</main>
							<Footer />
						</div>
					</ThemeProvider>
				</UserProvider>
			</body>
		</html>
	);
}
