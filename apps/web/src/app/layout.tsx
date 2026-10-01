import type { Metadata } from 'next';
import './globals.css';
import { MarketplaceProvider } from '../context/MarketplaceContext';

export const metadata: Metadata = {
  title: 'BitsB2B | Ethiopia B2B Marketplace',
  description: 'Connecting importers, wholesalers, producers, and buyers across Ethiopia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F1F2F5] text-[#1E2128] min-h-screen font-sans antialiased" suppressHydrationWarning>
        <MarketplaceProvider>
          {children}
        </MarketplaceProvider>
      </body>
    </html>
  );
}
