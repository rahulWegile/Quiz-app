import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/navigation";  // ✅ correct
import CaptchaProvider from "./components/captcha";     // ✅ add this
import Footer from "./components/footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrainBolt",
  description: "Challenge your knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
       <CaptchaProvider>
  <Navigation>
    {children}
  </Navigation>
  <Footer />
</CaptchaProvider>
      </body>
    </html>
  );
}