import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { Providers } from '@/components/Providers';
import NavigationBar from '@/components/NavigationBar';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import Footer from '@/components/footer/Footer';


export const metadata: Metadata = {
  title: {
    default: "Геній майго месца — Сэнсавыя падарожжы па Беларусі",
    template: "%s | ГММ"
  },
  description: "Аўтарскія экскурсіі і сэнсавы турызм па Беларусі. Падарожжы з геніямі месца: гісторыя, культура і глыбокія сэнсы.",
  keywords: ["турызм па Беларусі", "экскурсіі Мінск", "геній месца", "сэнсавы турызм", "гісторыя Беларусі"],
  authors: [{ name: "ГММ" }],
  metadataBase: new URL('https://gmm.by'),
  openGraph: {
    title: "Геній майго месца — Сэнсавыя падарожжы па Беларусі",
    description: "Адкрыйце Беларусь праз сэнсы і гісторыі выдатных людзей.",
    url: 'https://gmm.by',
    siteName: 'GMM.BY',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'be_BY',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="be">
      <body className="flex min-h-screen bg-slate-50">
        <AnalyticsTracker />
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <NavigationBar />
          <Providers>
            {children}
          </Providers>
          <ScrollToTopButton />
          <Footer />
        </div>
      </body>
    </html>
  );
}
