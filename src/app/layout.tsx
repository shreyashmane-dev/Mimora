import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memora — Premium AI Birthday Memories Platform",
  description: "Turn memories into unforgettable, cinematic birthday experiences using AI and interactive storytelling.",
  metadataBase: new URL("http://localhost:3000"),
  verification: {
    google: "4NSWsjhj1Mb9PyWGNhBwYBjq7Y5kUiFoeEAtTcgSmOc",
  },
  openGraph: {
    title: "Memora — Premium AI Birthday Memories Platform",
    description: "Turn memories into unforgettable, cinematic birthday experiences using AI and interactive storytelling.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${poppins.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-[#f4f4f5] selection:bg-purple-500/30 selection:text-purple-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
