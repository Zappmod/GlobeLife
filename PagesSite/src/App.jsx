import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import HubPage from './components/HubPage.jsx'
import WorkshopPage from './components/WorkshopPage.jsx'
import LabView from './components/LabView.jsx'
import DecksPage from './components/DecksPage.jsx'
import BuildPage from './components/BuildPage.jsx'
import PrereqsPage from './components/PrereqsPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import { isAuthenticated } from './auth.js'

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated())

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />
  }

  return (
    <BrowserRouter basename="/GlobeLife">
      <Header />
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/workshop" element={<WorkshopPage />} />
        <Route path="/workshop/lab/:labId" element={<LabView />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/prereqs" element={<PrereqsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
