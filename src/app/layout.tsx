
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import { SettingsProvider } from '@/context/settings-context';

export const metadata: Metadata = {
  title: 'Go Swami Defence Academy',
  description: 'राष्ट्र प्रथम, शिक्षा सर्वोपरि',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SettingsProvider>
          <LanguageProvider>
              {children}
              <Toaster />
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
