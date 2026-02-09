import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real-Time Avatars: A Comparative Guide",
  description: "Compare four approaches to building real-time digital avatars: MetaHuman pipelines, generative video models, neural Gaussian splatting, and streaming avatar infrastructure.",
  openGraph: {
    title: "Real-Time Avatars: A Comparative Guide",
    description: "Compare four approaches to building real-time digital avatars — from MetaHuman pipelines to generative video, Gaussian splatting, and streaming infrastructure.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time Avatars: A Comparative Guide",
    description: "Compare four approaches to building real-time digital avatars — with interactive demos and implementation guides.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
