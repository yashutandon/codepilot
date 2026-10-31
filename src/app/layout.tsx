import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodePilot – AI-Powered Code Editor",
  description:
    "CodePilot AI is an intelligent code editor inspired by Cursor IDE. It offers context-aware AI chat, inline code explanations, refactoring, bug fixing, and diff previews to boost developer productivity.",
  keywords: [
    "AI code editor",
    "Cursor IDE clone",
    "Monaco editor",
    "AI for developers",
    "Code refactoring AI",
    "AI programming assistant",
    "Next.js AI project",
    "Developer productivity tools",
  ],
  icons: {
    icon: "/logo.svg",
  },
  authors: [{ name: "Yashu Tandon" }],
  creator: "Yashu Tandon",
  metadataBase: new URL("https://codepilot-ai.vercel.app"),
  openGraph: {
    title: "CodePilot AI – AI-Powered Code Editor",
    description:
      "An AI-driven code editor with contextual code understanding, refactoring, and real-time assistance for developers.",
    url: "https://codepilot-ai.vercel.app",
    siteName: "CodePilot AI",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CodePilot AI – AI Code Editor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodePilot AI – AI Code Editor",
    description:
      "AI-powered code editor with contextual understanding, inline refactoring, and diff previews.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
