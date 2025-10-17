import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: 'LocalTruth | AI for Real-Time Misinformation Detection',
  description: 'LocalTruth is an Agentic AI platform that autonomously detects, verifies, and explains emerging misinformation in real time and in local languages.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <LanguageProvider>
          <FirebaseClientProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </FirebaseClientProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
