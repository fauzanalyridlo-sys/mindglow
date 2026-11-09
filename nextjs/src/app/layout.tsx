import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-mindglow",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindGlow",
  description: "MindGlow — teman perjalanan kesehatan mental dan produktivitasmu.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={lato.variable}>
      <body>{children}</body>
    </html>
  );
}
