// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/ThemeProvider"; // Garanta que o arquivo chama ThemeProvider.tsx
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QAura | Suas Quests do Dia",
  description: "Gamifique sua rotina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning é vital aqui para evitar erros de servidor vs cliente no tema
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {/* O conteúdo do app fica aqui dentro */}
          {children}
          
          {/* O Toaster também respeita o tema automaticamente agora */}
          <Toaster position="bottom-right" theme="system" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}