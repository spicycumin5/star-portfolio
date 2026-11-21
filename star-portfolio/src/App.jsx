import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './components/Nav'
import StarCanvas from './components/StarCanvas'
import Home from './pages/Home'
import WorkDetail from './pages/WorkDetail'
import MonthDetail from './pages/MonthDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <StarCanvas />
      <Nav />
      <ScrollToTop />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/work/:id/:month" element={<MonthDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
    </>
  )
}
