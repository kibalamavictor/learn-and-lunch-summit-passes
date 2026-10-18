import type { Metadata } from "next";
import "./globals.css";
import "./summit-theme.css";

export const metadata: Metadata = {
  title: "Summit Pass · Learn And Lunch",
  description: "Campus Food Security Summit 2026 — guest check-in and single-use lunch passes.",
  referrer: "no-referrer",
  icons: {
    icon: "/summit-logo.png",
    shortcut: "/summit-logo.png",
  },
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
