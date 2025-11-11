import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TechGear - MCP Headphones Helper",
    description: "Find the perfect headphones with AI assistance",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}

