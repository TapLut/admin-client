import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/ReduxProvider";
import { ToastContainer } from "@/components/ui";
import { AuthGuard } from "@/components/auth";
import { ThemeProvider } from "@/components/providers";

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
  // Script to prevent flash of wrong theme
  const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ReduxProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <ToastContainer />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
