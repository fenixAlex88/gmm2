import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { Providers } from '@/components/Providers';
import NavigationBar from '@/components/NavigationBar';


export const metadata: Metadata = {
  title: "Геній майго месца / Гений моего места / ГММ",
  description: "Сэнсавы турызм. Падарожжы з геніямі / Смысловой турызм. Экскурсии с гениями",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="be">
      <body className="flex min-h-screen bg-slate-50">
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <NavigationBar />

          <main className="flex-grow w-full">
            <Providers>
              {children}
            </Providers>
          </main>
          <ScrollToTopButton />
          <Footer />
        </div>
      </body>
    </html>
  );
}
