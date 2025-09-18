import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'
import HeaderImproved from './components/site-header'
import Footer from './components/footer'
import KeyboardNavigation from './components/keyboard-navigation'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <>
      <KeyboardNavigation />
      <HeaderImproved />
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={<r.Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
    
  )
}
