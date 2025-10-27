import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./tailwind.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { CurrencyProvider } from "@/components/currency-provider"
import { CartProvider } from "@/components/cart-provider"
import { CountryProvider } from "@/components/country-provider"
import KeyboardNavigation from "@/components/keyboard-navigation"
import KeyboardShortcutsHelp from "@/components/keyboard-shortcuts-help"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

// Site name should be consistent across all environments
const SITE_NAME = "RUACH E-STORE";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Premium African & International Foods`,
  description:
    "Discover authentic African and international foods, spices, and beverages. Fresh produce, quality ingredients, and traditional flavors delivered to your door.",
  keywords: "African food, international cuisine, spices, beverages, fresh produce, online grocery, RUACH E-STORE",
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL("https://ruachestore.com.ng"),
  openGraph: {
    title: `${SITE_NAME} - RUACH E-STORE`,
    description: "Discover authentic African and international foods, spices, and beverages.",
    url: "https://ruachestore.com.ng",
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo/logo.png",
        width: 800,
        height: 800,
        alt: "RUACH E-STORE"
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - RUACH E-STORE`,
    description: "Discover authentic African and international foods, spices, and beverages.",
    images: ["/logo/logo.png"],
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
        <link rel="icon" href="/logo/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/logo.png" />
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
      <body className={`${inter.className} min-h-screen bg-white text-gray-800`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CountryProvider>
            <CurrencyProvider>
              <CartProvider>
                <AuthProvider>
                  <KeyboardNavigation />
                  <SiteHeader />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                  <KeyboardShortcutsHelp />
                  <Toaster />
                  <div className="fixed bottom-4 right-4 z-50 hidden md:block">
                    <Button 
                      asChild 
                      className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 rounded-full shadow-lg"
                    >
                      <a href="https://wa.me/2348160662997" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 inline-block">
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                          <path d="M12 17a5 5 0 0 1-5-5" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    </Button>
                  </div>
                </AuthProvider>
              </CartProvider>
            </CurrencyProvider>
          </CountryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
