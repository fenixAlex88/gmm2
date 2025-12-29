import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Добавляем хороший шрифт
// import { Toaster } from "sonner"; // Рекомендую поставить: npm i sonner
import "../globals.css";
import Header from "@/components/Header";

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

        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="py-6 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Геній майго месца
        </footer>

        {/* Компонент для всплывающих уведомлений */}
        {/* <Toaster position="bottom-right" richColors /> */}
      </body>
    </html>
  );
}