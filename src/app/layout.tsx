import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retirement Planning Tools",
  description: "Plan your financial future with our comprehensive retirement calculators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
