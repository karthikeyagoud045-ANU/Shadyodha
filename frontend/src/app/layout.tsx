import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DRISHTI AI — Explainable Retinal Screening",
  description: "Explainable AI for Diabetic Retinopathy Screening in Rural India. SIH26038 · ShadYodha",
  manifest: "/manifest.json",
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-ink-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
