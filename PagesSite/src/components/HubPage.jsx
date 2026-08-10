import { Link } from 'react-router-dom'

const tiles = [
  {
    id: 'workshop',
    title: 'Workshop Site',
    description: 'Eight hands-on labs for the Bob Premium Package for Z workshop event.',
    icon: '🚀',
    to: '/workshop',
    gradient: 'from-ibm-indigo to-ibm-purple',
    enabled: true,
  },
  {
    id: 'decks',
    title: 'Decks',
    description: 'Preview and download the CE Planning Guide, Client Facing deck, and the Workshop PP4Z One Pager.',
    icon: '📊',
    to: '/decks',
    gradient: 'from-ibm-blue to-ibm-indigo',
    enabled: true,
  },
  {
    id: 'build',
    title: 'Build a Client Facing Site',
    description: 'Configure and download a ready-to-deploy lab site customized for your client.',
    icon: '🏗️',
    to: '/build',
    gradient: 'from-ibm-purple to-[#a78bfa]',
    enabled: true,
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Additional tools, templates, and reference material.',
    icon: '📚',
    to: null,
    gradient: 'from-gray-400 to-gray-500',
    enabled: false,
  },
]

export default function HubPage() {
  return (
    <div className="min-h-screen bg-ibm-bg pt-12">
      {/* Hero */}
      <div className="bg-white border-b border-ibm-border">
        <div className="max-w-5xl mx-auto px-8 py-12 flex items-center justify-between gap-8">
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <img src="/GlobeLife/Bob.png" alt="Bob" className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ibm-indigo mb-1">IBM Client Engineering</p>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  Bob Premium Package for Z
                </h1>
              </div>
            </div>
            <p className="text-lg text-gray-500 font-light mb-2">CE Toolkit</p>
            <p className="text-gray-600 leading-relaxed">
              Your central hub for Workshop lab guides, presentation decks, and client site generation tools.
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <img
              src="/GlobeLife/BobMainframe.png"
              alt="Bob with mainframe"
              className="h-56 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Tiles */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">What would you like to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiles.map((tile) => {
            const inner = (
              <>
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${tile.gradient} p-5 flex items-center justify-between`}>
                  <span className="text-white/90 text-3xl">{tile.icon}</span>
                  {!tile.enabled && (
                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Coming Soon
                    </span>
                  )}
                  {tile.enabled && (
                    <span className="text-white/70 text-lg font-light">→</span>
                  )}
                </div>
                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className={`font-semibold text-lg mb-2 leading-snug ${tile.enabled ? 'text-gray-900 group-hover:text-ibm-blue transition-colors' : 'text-gray-400'}`}>
                    {tile.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${tile.enabled ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tile.description}
                  </p>
                </div>
              </>
            )

            if (!tile.enabled) {
              return (
                <div key={tile.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col opacity-60 cursor-not-allowed">
                  {inner}
                </div>
              )
            }

            return (
              <Link
                key={tile.id}
                to={tile.to}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col no-underline"
              >
                {inner}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-8 pb-12 pt-2">
        <p className="text-center text-xs text-gray-400">
          Created by Sophie Harrison &amp; Renate Hamrick — Application Modernization for Z team
        </p>
      </div>
    </div>
  )
}
