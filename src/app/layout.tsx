
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import { SettingsProvider } from '@/context/settings-context';
import { AuthProvider } from '@/context/auth-context';
import { Inter, Teko, Dancing_Script } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const teko = Teko({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-teko',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-dancing-script',
});

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${teko.variable} ${dancingScript.variable} font-body`}>
        <SettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
