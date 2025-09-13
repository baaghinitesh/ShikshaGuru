import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
// import { getUser } from '@/lib/db/queries';
// import { SWRConfig } from 'swr';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import ShikshaHeader from '@/components/shiksha-header';
import AIChatAssistantPlaceholder from '@/components/ai-chat-assistant-placeholder';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { SocketProvider } from '@/lib/contexts/SocketContext';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: config.app.name + ' - Complete Tutoring Marketplace',
  description: config.app.description,
  keywords: 'tutoring, education, teachers, students, learning, marketplace',
  authors: [{ name: 'ShikshaGuru Team' }]
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="flex flex-col min-h-screen">
                <ShikshaHeader />
                {children}
              </div>
              <AIChatAssistantPlaceholder />
            </SocketProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
