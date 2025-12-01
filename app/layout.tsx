import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subway Time",
  description:
    "지하철/버스 이동 시간을 지금의 나에게 맞는 프런트엔드 학습팩으로 채워주는 개인 학습 도구",
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: "#050816"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

