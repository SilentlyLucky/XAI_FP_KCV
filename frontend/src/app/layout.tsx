import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VISIONGUARD",
  description: "VISIONGUARD: Mengungkap Kegagalan Persepsi Model Deteksi pada Kendaraan Otonom dengan Explainable AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface flex flex-col min-h-screen font-body">
        {children}
      </body>
    </html>
  );
}
