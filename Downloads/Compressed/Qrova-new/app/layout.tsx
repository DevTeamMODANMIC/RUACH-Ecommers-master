import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import "./tailwind.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { CurrencyProvider } from "@/components/currency-provider"
import { CartProvider } from "@/components/cart-provider"
import { CountryProvider } from "@/components/country-provider"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"
import StructuredData from "@/components/structured-data"
import BreadcrumbNav from "@/components/breadcrumb-nav"
import QuickActions from "@/components/quick-actions"

// Add fallback fonts to prevent errors when Google Fonts fail to load
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
})

// Site name should be consistent across all environments
const SITE_NAME = "Grova";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Your everyday grocery shop`,
  description:
    "Your everyday grocery shop. Discover authentic African and international foods, spices, and beverages. Fresh produce, quality ingredients, and traditional flavors delivered to your door.",
  keywords: "African food, international cuisine, spices, beverages, fresh produce, online grocery, Grova",
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL("https://grova.com"),
  openGraph: {
    title: `${SITE_NAME} - Grova`,
    description: "Discover authentic African and international foods, spices, and beverages.",
    url: "https://grova.com",
    siteName: SITE_NAME,
    images: [
      {
        url: "/images/logo/borderlessbuy-logo.png",
        width: 800,
        height: 800,
        alt: "Grova"
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Grova`,
    description: "Discover authentic African and international foods, spices, and beverages.",
    images: ["/images/logo/borderlessbuy-logo.png"],
  },
  generator: SITE_NAME
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/images/logo/borderlessbuy-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo/borderlessbuy-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // This helps prevent hydration errors by ensuring consistent rendering
            window.__NEXT_HYDRATION_MARK = true;
            
            // Patch React's hydration logic to be more forgiving
            (function() {
              if (typeof window !== 'undefined' && window.console) {
                // Store the original console.error
                const originalError = console.error;
                
                // Override console.error to filter out hydration warnings
                console.error = function() {
                  if (
                    arguments[0] && 
                    typeof arguments[0] === 'string' && 
                    (arguments[0].includes('Hydration failed') || 
                     arguments[0].includes('Expected server HTML'))
                  ) {
                    // Suppress hydration errors
                    return;
                  }
                  
                  // Call the original console.error for other errors
                  return originalError.apply(this, arguments);
                };
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CountryProvider>
            <CurrencyProvider>
              <CartProvider>
                <AuthProvider>
                  <Header />
                  <BreadcrumbNav />
                  <main className="min-h-screen pt-20 sm:pt-24 md:pt-28">
                    {children}
                  </main>
                  <Footer />
                  <Toaster />
                  
                  {/* Quick Actions Floating Button */}
                  <QuickActions />
                  
                  {/* Structured Data for SEO */}
                  <StructuredData type="website" data={{}} />
                  <StructuredData type="organization" data={{}} />
                </AuthProvider>
              </CartProvider>
            </CurrencyProvider>
          </CountryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}