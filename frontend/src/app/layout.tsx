import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { CookieProvider } from "../context/CookieContext";
import { SmoothScrollProvider } from "../context/SmoothScrollContext";
import CookieBanner from "../components/cookie/CookieBanner";
import CookiePreferences from "../components/cookie/CookiePreferences";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Meet Chetanpura — AI Systems Engineer",
  description: "AI agents, machine-learning systems, and intelligent automation engineered for measurable business outcomes.",
  keywords: ["AI Engineer", "ML Engineer", "Data Scientist", "Data Analyst", "BI Analyst", "Automation Engineering", "Python", "Power BI", "SQL"],
  authors: [{ name: "Chetanpura Meet" }],
  openGraph: {
    title: "Chetanpura Meet — AI Portfolio",
    description: "AI & Automation systems delivering measurable business impact.",
    url: "https://meetchetanpura.com",
    siteName: "Chetanpura Meet — AI Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chetanpura Meet — AI Portfolio",
    description: "AI & Automation systems delivering measurable business impact.",
  },
  alternates: {
    canonical: "https://meetchetanpura.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-void text-text-primary relative`}
      >
        <ThemeProvider>
          <SmoothScrollProvider>
            <CookieProvider>
              {children}
              <CookieBanner />
              <CookiePreferences />
            </CookieProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
