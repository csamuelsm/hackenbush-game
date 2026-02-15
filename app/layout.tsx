import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ColorModeButton,
  DarkMode,
  LightMode,
  useColorMode,
  useColorModeValue,
} from "@/components/ui/color-mode"
import { Provider } from "@/components/ui/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hackenbush - Daily Combinatorial Game",
    template: "%s | Hackenbush Game"
  },
  description: "Play Hackenbush online, the classic combinatorial game by John Conway. Learn game theory while playing this strategic mathematical game. Free daily puzzles!",
  keywords: [
    "Hackenbush",
    "John Conway",
    "combinatorial game theory",
    "mathematical games",
    "strategy games",
    "game theory",
    "surreal numbers",
    "Winning Ways",
    "jogos combinatórios",
    "teoria dos jogos",
    "jogos combinatórios",
    "teoria dos grafos",
    "graph theory",
    "graph games",
    "jogos em grafos",
    "teoria da computação",
    "computer science games",
    "jeux combinatoires",
    "algoritmos",
    "algorithms",
    "algorithmes",
    "théorie des graphes",
    "jeux mathématiques",
    "mathématiques récréatives",
    "matemática recreativa",
    "recreational mathematics",
    "jogo didático",
    "jogo para sala de aula"
  ],
  authors: [
    {
      name: "Samuel Santos",
      url: "https://csamuelssm.vercel.app/"
    }
  ],
  creator: "Samuel Santos",
  publisher: "Samuel Santos",

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_BR", "fr_FR"],
    url: "https://hackenbush.vercel.app",
    title: "Hackenbush - Daily Combinatorial Game",
    description: "Play Hackenbush online, the classic combinatorial game by John Conway. Learn game theory while playing this strategic mathematical game. Free daily puzzles!",
    siteName: "Hackenbush Game",
    images: [
      {
        url: "https://hackenbush.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hackenbush Game - Daily Combinatorial Puzzle"
      }
    ]
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Hackenbush - John Conway's Combinatorial Game",
    description: "Play Hackenbush online. Daily puzzles and game theory challenges!",
    images: ["https://hackenbush.vercel.app/twitter-image.png"],
    creator: "@csamuelssm" // Adicione seu Twitter se tiver
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Manifest
  manifest: "/site.webmanifest",
  
  // Verification (adicione quando tiver as contas)
  verification: {
    google: "5Vfg2bdITXaloOzwyNuVxRhxijZKLZfXQxjgLslO", // Google Search Console
  },
  
  // Category
  category: "games",

  // App links
  metadataBase: new URL('https://hackenbush.vercel.app'),
  
  // Additional meta tags
  other: {
    "application-name": "Hackenbush",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Hackenbush",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
