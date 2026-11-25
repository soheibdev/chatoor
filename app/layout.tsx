import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono, Outfit, Unbounded } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import Chrome from "@/components/layout/Chrome";
import { THEME_BOOT } from "@/lib/theme";

/* Display + fallbacks loaded through next/font. Google Sans Flex and Google Sans Code are
   not exposed by next/font, so they come from the same Google Fonts stylesheet the design
   uses, with Outfit / JetBrains Mono as the documented fallbacks. */
const unbounded = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-unbounded", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-outfit", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jetbrains", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "600", "700"], variable: "--font-plex-ar", display: "swap" });

export const metadata: Metadata = {
  title: "CHATOOOR · GDGC Batna",
  description:
    "The challenge arena of GDG Batna’s Dev Department. Weekly Problem Solving, Cybersecurity and AI/ML challenges for GDGC Batna members.",
  icons: { icon: "/assets/gdgc-mark.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E0D16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${unbounded.variable} ${outfit.variable} ${jetbrains.variable} ${plexAr.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..800&family=Google+Sans+Code:wght@400..700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <Providers>
          <Chrome>{children}</Chrome>
        </Providers>
      </body>
    </html>
  );
}
