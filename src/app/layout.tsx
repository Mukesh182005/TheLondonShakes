import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, EB_Garamond } from 'next/font/google';
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { ClerkProvider } from "@clerk/nextjs";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "The London Shakes — Premium Shakes, Burgers & Café",
  description: "The London Shakes — Premium thick shakes, gourmet burgers, crispy waffles, and artisan café experiences. Order online or reserve your table today.",
  keywords: ["The London Shakes", "thick shakes", "burgers", "waffles", "café", "restaurant", "order online"],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "The London Shakes — Premium Shakes, Burgers & Café",
    description: "Premium thick shakes, gourmet burgers, crispy waffles, and artisan café experiences. Order online or reserve your table today.",
    type: "website",
    siteName: "The London Shakes",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The London Shakes — Premium Shakes, Burgers & Café",
    description: "Premium thick shakes, gourmet burgers, crispy waffles, and artisan café experiences.",
  },
};

const hasClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning className={`h-full ${cormorant.variable} ${inter.variable} ${ebGaramond.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (!t) {
                var h = new Date().getHours();
                if (h >= 19 || h < 7) {
                  document.documentElement.classList.add('dark');
                }
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full bg-black" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );

  if (hasClerkKeys) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
