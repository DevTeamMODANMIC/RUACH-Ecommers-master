import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import Hero from './components/Hero'
import Footer from './components/Footer'
import CharacteristicsPage from './pages/CharacteristicsPage'
import BiblePassagesPage from './pages/BiblePassagesPage'
import LoveInNigeriaPage from './pages/LoveInNigeriaPage'
import TestimoniesPage from './pages/TestimoniesPage'
import YellowCardPage from './pages/YellowCardPage'
import LoveChallengePage from './pages/LoveChallengePage'
import ShareTestimonyPage from './pages/ShareTestimonyPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/characteristics" element={<CharacteristicsPage />} />
          <Route path="/bible-passages" element={<BiblePassagesPage />} />
          <Route path="/love-in-nigeria" element={<LoveInNigeriaPage />} />
          <Route path="/testimonies" element={<TestimoniesPage />} />
          <Route path="/yellow-card" element={<YellowCardPage />} />
          <Route path="/love-challenge" element={<LoveChallengePage />} />
          <Route path="/share-testimony" element={<ShareTestimonyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}