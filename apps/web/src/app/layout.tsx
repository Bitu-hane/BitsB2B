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
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased" suppressHydrationWarning>
        <MarketplaceProvider>
          {children}
        </MarketplaceProvider>
      </body>
    </html>
  );
}
