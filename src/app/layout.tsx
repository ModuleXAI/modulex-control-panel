import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthHydration } from "@/components/providers/auth-hydration";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ModuleX Control Panel",
  description: "Professional admin dashboard for ModuleX backend management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthHydration>
            {children}
          </AuthHydration>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
