import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

export const metadata: Metadata = {
  title: "Gestão Finance - Gestão de Cobranças",
  description: "Sistema de Gestão de Contas a Receber e Cobranças",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
