import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DownloadProgressProvider } from "@/components/download-loader";
import { BrowserCapabilityNotice, NoscriptNotice } from "@/components/fallback/boundaries";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Flow",
  description: "Platform pengelolaan bisnis terpadu: keuangan, penjualan, stok, klien, dan operasional.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "var(--color-accent)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <NoscriptNotice />
        <BrowserCapabilityNotice />
        <DownloadProgressProvider>{children}</DownloadProgressProvider>
      </body>
    </html>
  );
}
