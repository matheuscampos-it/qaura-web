import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QAura | Suas Quests do Dia",
  description: "Gamifique sua rotina e domine sua aura.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning na tag HTML é OBRIGATÓRIO ao usar next-themes
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-aura-primary/30`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {/* O layout renderiza o conteúdo aqui */}
          {children}
          
          {/* Toaster fora do fluxo de renderização principal, mas dentro do ThemeProvider */}
          <Toaster 
            position="bottom-right" 
            theme="system" 
            richColors 
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}