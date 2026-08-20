import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';

export const metadata: Metadata = {
  title: 'WynMotion AI Studio — Video & Voiceover',
  description: 'WynMotion AI Studio for iOS — AI Animated Explainer Video, 48kHz Voiceover, Art & Cloud Library',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAFAFC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col antialiased selection:bg-rose-100 selection:text-rose-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
