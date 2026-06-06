import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50`}
      >
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
                  CRM Tool
                </Link>
                <nav className="ml-6 flex space-x-4">
                  <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Home</Link>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Login</Link>
                <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">Register</Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} CRM Tool. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

