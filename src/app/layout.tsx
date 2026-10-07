import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Featherpay — Send a tip",
  description:
    "Send a quick, secure tip to your favorite creator. No account needed.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://featherpay.io",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}