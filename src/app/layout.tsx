import type { Metadata } from "next";
import { Mukta, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-deva",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "भाजप उद्योग आघाडी — उद्योग साथी AI | BJP Udhyog Aghadi Maharashtra",
  description:
    "महाराष्ट्रातील उद्योजक, MSME, स्टार्टअप्स आणि व्यापाऱ्यांसाठी २४x७ रिअल-टाइम AI मार्गदर्शक व तक्रार निवारण मंच — उद्योगसाथी AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr"
      className={`${mukta.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} dark`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="font-deva antialiased bg-[#030712] text-slate-100 min-h-screen selection:bg-[#FF6B00]/30 selection:text-orange-100"
      >
        {children}
      </body>
    </html>
  );
}

