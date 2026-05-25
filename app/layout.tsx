import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qsentia - Investor Intelligence Platform",
  description: "Advanced research and analytics platform for investor insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full font-sans antialiased bg-[#eeeef6] flex flex-col">{children}</body>
    </html>
  );
}
