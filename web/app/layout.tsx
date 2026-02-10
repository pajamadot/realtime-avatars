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
  description: "Compare three approaches to building real-time digital avatars: MetaHuman pipelines, video generation models, and neural Gaussian splatting.",
  metadataBase: new URL("https://realtime-avatars.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Real-Time Avatars: A Comparative Guide",
    description: "Compare three approaches to building real-time digital avatars — MetaHuman pipelines, video generation, and Gaussian splatting.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time Avatars: A Comparative Guide",
    description: "Compare three approaches to building real-time digital avatars — with interactive demos and implementation guides.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://accounts.rapport.cloud" />
        <link rel="preconnect" href="https://accounts.rapport.cloud" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
