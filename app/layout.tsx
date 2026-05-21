import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.qsentia.com'),
  title: {
    default: 'Qsentia | Investor Intelligence Platform',
    template: '%s | Qsentia',
  },
  description:
    'Institutional-grade reinforcement learning, market intelligence, and live portfolio research.',
  applicationName: 'Qsentia',
  themeColor: '#070815',
  openGraph: {
    title: 'Qsentia | Investor Intelligence Platform',
    description:
      'Institutional-grade reinforcement learning, market intelligence, and live portfolio research.',
    url: 'https://www.qsentia.com',
    siteName: 'Qsentia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qsentia | Investor Intelligence Platform',
    description:
      'Institutional-grade reinforcement learning, market intelligence, and live portfolio research.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[#070815] font-sans antialiased text-[#edf0fb] flex flex-col">
        {children}
      </body>
    </html>
  );
}
