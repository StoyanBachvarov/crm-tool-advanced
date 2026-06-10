import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM Tool",
  description: "Advanced CRM Tool for Sales Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-gray-50`}
      >
        <SiteHeader />

        <main className="min-w-0 flex-grow">{children}</main>

        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CRM Tool. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
