import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";

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
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>


    </html>
  );
}
