import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export const metadata: Metadata = {
  title: 'LocalTruth | AI for Real-Time Misinformation Detection',
  description: 'LocalTruth is an Agentic AI platform that autonomously detects, verifies, and explains emerging misinformation in real time and in local languages.',
};

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <NextIntlClientProvider messages={messages}>
          <FirebaseClientProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </FirebaseClientProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
