import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTopButton from '@/components/ScrollToTopButton';
import SideMenu from '@/components/SideMenu';

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
      <body className="flex min-h-screen">
        <SideMenu />
        <div className="flex flex-col flex-1 min-h-screen lg:pl-64 md:pl-16 pl-0">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <ScrollToTopButton />
          <Footer />
        </div>
      </body>


    </html>
  );
}
