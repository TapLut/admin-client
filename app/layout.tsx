import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/ReduxProvider";
import { ToastContainer } from "@/components/ui";
import { AuthGuard } from "@/components/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taplut Admin",
  description: "Admin dashboard for Taplut P2E platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <ToastContainer />
        </ReduxProvider>
      </body>
    </html>
  );
}
