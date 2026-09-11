import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Percentage Optimization Dashboard",
  description:
    "Distribute a pool of questions across Easy / Medium / Hard difficulty to match a desired percentage distribution. Computes four strategies side by side.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
