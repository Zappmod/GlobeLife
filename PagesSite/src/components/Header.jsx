import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const path = location.pathname

  const isHub = path === '/'
  const isWorkshop = path.startsWith('/workshop')
  const isDecks = path.startsWith('/decks')
  const isBuild = path.startsWith('/build')
  const isPrereqs = path.startsWith('/prereqs')

  const navCls = (active) =>
    `px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-ibm-blue text-ibm-blue'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`

  // Workshop section: Guide + Prerequisites + bob.ibm.com
  const workshopNav = (
    <>
      <Link to="/workshop" className={navCls(isWorkshop && !isPrereqs)}>
        Workshop Guide
      </Link>
      <Link to="/prereqs" className={navCls(isPrereqs)}>
        Prerequisites
      </Link>
      <a
        href="https://bob.ibm.com"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
      >
        bob.ibm.com ↗
      </a>
    </>
  )

  const navContent =
    isWorkshop || isPrereqs
      ? workshopNav
      : null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-ibm-border h-12 flex items-center px-6 gap-8">
      {/* Wordmark */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <img src="/GlobeLife/Bob2.png" alt="Bob" className="h-7 w-7 object-contain" />
        <span className="text-gray-900 text-base tracking-tight">
          <span className="font-light">IBM </span>
          <span className="font-bold">Bob</span>
          <span className="font-light text-gray-400 ml-2 text-sm">Premium Package for Z</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {navContent}
      </nav>

      {/* Return to Hub */}
      {!isHub && (
        <Link
          to="/"
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded transition-colors"
        >
          ← Hub
        </Link>
      )}
    </header>
  )
}
