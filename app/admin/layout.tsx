import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import AdminNavbar from '@/components/AdminNavbar';

// Настройка шрифта
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ГММ",
    default: "Геній майго месца",
  },
  description: "Сэнсавы турызм. Падарожжы з геніямі",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="be" className="h-full">
      <body className={`${inter.className} flex min-h-screen flex-col bg-slate-50 text-slate-900`}>

        <Header />
        <AdminNavbar />
        <main className="mx-8 px-4 pb-8 pt-24">
          {children}
        </main>

        <footer className="py-6 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Геній майго месца
        </footer>
      </body>
    </html>
  );
}