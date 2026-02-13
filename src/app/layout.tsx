import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "UPMM - Unidos Por Um Mundo Melhor",
  description: "Plataforma comunitária focada na valorização da estética visual das periferias brasileiras. Compartilhe, remixe e celebre a arte urbana.",
  keywords: ["UPMM", "periferia", "arte urbana", "graffiti", "fotografia", "comunidade", "Brasil", "remix", "cultura"],
  authors: [{ name: "UPMM Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "UPMM - Unidos Por Um Mundo Melhor",
    description: "Valorização da estética visual das periferias brasileiras",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UPMM - Unidos Por Um Mundo Melhor",
    description: "Valorização da estética visual das periferias brasileiras",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Cocogoose';
              src: local('Cocogoose Pro'), local('Cocogoose');
              font-weight: 900;
              font-display: swap;
            }
            :root {
              --font-cocogoose: 'Cocogoose', 'Montserrat', system-ui, sans-serif;
            }
          `
        }} />
      </head>
      <body className={`${montserrat.variable} antialiased bg-[#FDFCFB] text-[#2D2A26] min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
