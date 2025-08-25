import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'
import Header from './components/header'
import Footer from './components/footer'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={<r.Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
    
  )
}
