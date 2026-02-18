import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UNIQLO/GU Closet",
  description: "UNIQLO/GUのアイテムでクローゼットを管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProfileProvider>
          {children}
          <BottomNav />
        </ProfileProvider>
      </body>
    </html>
  );
}
