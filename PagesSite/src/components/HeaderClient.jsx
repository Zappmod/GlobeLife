import { Link, useLocation } from 'react-router-dom'

export default function HeaderClient() {
  const location = useLocation()
  const path = location.pathname

  const isWorkshop = path === '/' || path.startsWith('/workshop')
  const isPrereqs = path.startsWith('/prereqs')

  const navCls = (active) =>
    `px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-ibm-blue text-ibm-blue'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`

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
        <Link to="/workshop" className={navCls(isWorkshop)}>
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
      </nav>
    </header>
  )
}
