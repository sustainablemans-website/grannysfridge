import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "阿嬤的冰箱  智慧食材管理",
  description: "透過條碼掃描、視覺化空間管理，輕鬆追蹤家中食材與物品狀態，再也不浪費食物。",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "阿嬤的冰箱",
    description: "智慧家庭食材管理 App",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}