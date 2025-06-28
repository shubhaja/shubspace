import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ShubspaceProvider } from "@/lib/context/ShubspaceContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "s(h)ubspace - interactive face blending",
  description: "create your perfect shub blend with interactive controls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ShubspaceProvider>
          {children}
        </ShubspaceProvider>
      </body>
    </html>
  );
}
