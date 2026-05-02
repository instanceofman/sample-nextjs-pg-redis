import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vane sample — Next.js + Postgres + Redis",
  description: "T3-stack sample app dùng để test deploy bằng vane",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
