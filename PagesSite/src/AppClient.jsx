import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeaderClient from './components/HeaderClient.jsx'
import WorkshopPage from './components/WorkshopPage.jsx'
import LabView from './components/LabView.jsx'
import PrereqsPage from './components/PrereqsPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import { isAuthenticated } from './auth.js'

export default function AppClient() {
  const [authed, setAuthed] = useState(isAuthenticated())

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />
  }

  return (
    <BrowserRouter basename="/GlobeLife">
      <HeaderClient />
      <Routes>
        <Route path="/" element={<WorkshopPage />} />
        <Route path="/workshop" element={<WorkshopPage />} />
        <Route path="/workshop/lab/:labId" element={<LabView />} />
        <Route path="/prereqs" element={<PrereqsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
