import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { CartProvider } from "./components/cart-provider"
import { CurrencyProvider } from "./components/currency-provider"
import { AuthProvider } from "./components/auth-provider"   // ✅ add this
import ScrollToTop from "./components/scroll-to-top"
import "./index.css"
import { loadConfig } from "./config";

// Loading component for top-level suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>        {/* ✅ wrap AuthProvider at the top */}
        <CurrencyProvider>  {/* ✅ wrap CurrencyProvider */}
          <CartProvider>    {/* ✅ wrap CartProvider */}
            <Suspense fallback={<LoadingComponent />}>
              <App />
            </Suspense>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

async function startApp() {
  await loadConfig();
}

startApp();