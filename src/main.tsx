import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { CartProvider } from "./components/cart-provider"
import { CurrencyProvider } from "./components/currency-provider"
import { AuthProvider } from "./components/auth-provider"   // ✅ add this
import ScrollToTop from "./components/scroll-to-top"
import "./index.css"
import { loadConfig } from "./config";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>        {/* ✅ wrap AuthProvider at the top */}
        <CurrencyProvider>  {/* ✅ wrap CurrencyProvider */}
          <CartProvider>    {/* ✅ wrap CartProvider */}
            <App />
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