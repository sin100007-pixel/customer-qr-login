import type { Metadata, Viewport } from "next";
import PWAClient from "./pwa-client";


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111827" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export const metadata: Metadata = {
  title: "EGOSE QR",
  description: "고객 전용 QR 코드 뷰어",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180" }],
  },
};

const BG_DARK = "#0F0C2E";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      import SessionHydrator from "./components/SessionHydrator";

const BG_DARK = "#0F0C2E";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          background: BG_DARK,
          color: "#fff",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <PWAClient />
                <SessionHydrator />
        {children}
      </body>
    </html>
  );
}