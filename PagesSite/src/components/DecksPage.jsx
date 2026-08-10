import { useState } from 'react'

const BASE = '/GlobeLife'

const decks = [
  {
    id: 'planning',
    title: 'CE Planning Guide',
    description: 'Internal planning guide for organising and running a Workshop event — agenda, setup checklist, and facilitator notes.',
    pdf: `${BASE}/decks/Workshop-Planning-Guide.pdf`,
    pptx: `${BASE}/decks/Workshop-Planning-Guide.pptx`,
    gradient: 'from-ibm-indigo to-ibm-purple',
    icon: '📋',
  },
  {
    id: 'client',
    title: 'Client Facing',
    description: 'Client-facing presentation covering Bob Premium Package for Z capabilities, use cases, and demo highlights.',
    pdf: `${BASE}/decks/Workshop-Client-Facing.pdf`,
    pptx: `${BASE}/decks/Workshop-Client-Facing.pptx`,
    gradient: 'from-ibm-blue to-ibm-indigo',
    icon: '🖥️',
  },
  {
    id: 'one-pager',
    title: 'Workshop PP4Z — One Pager',
    description: 'A concise one-pager overview of the Bob Premium Package for Z Workshop event.',
    pdf: `${BASE}/decks/Workshop_Premium_for_Z.pdf`,
    pptx: `${BASE}/decks/Workshop_Premium_for_Z.pptx`,
    gradient: 'from-ibm-purple to-[#a78bfa]',
    icon: '📄',
  },
]

export default function DecksPage() {
  const [preview, setPreview] = useState(null)

  return (
    <div className="min-h-screen bg-ibm-bg pt-12">
      {/* Page header */}
      <div className="bg-white border-b border-ibm-border">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-ibm-indigo mb-2">CE Toolkit</p>
          <h1 className="text-2xl font-bold text-gray-900">Decks</h1>
          <p className="text-gray-500 mt-1 text-sm">Preview in-browser or download the editable PowerPoint file.</p>
        </div>
      </div>

      {/* Deck cards */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${deck.gradient} p-5 flex items-center gap-3`}>
                <span className="text-3xl">{deck.icon}</span>
                <h2 className="text-white font-semibold text-lg">{deck.title}</h2>
              </div>
              {/* Body */}
              <div className="p-6 flex flex-col flex-1 gap-4">
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{deck.description}</p>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setPreview(deck)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-ibm-active text-ibm-indigo px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <a
                    href={deck.pptx}
                    download
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-ibm-blue text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors no-underline"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download (.pptx)
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Preview overlay */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
          {/* Overlay top bar */}
          <div className="flex items-center justify-between bg-gray-900 px-6 py-3 shrink-0">
            <span className="text-white font-semibold text-sm">{preview.title}</span>
            <button
              onClick={() => setPreview(null)}
              className="text-gray-300 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
          {/* iframe */}
          <iframe
            src={preview.pdf}
            className="flex-1 w-full border-0"
            title={preview.title}
          />
        </div>
      )}
    </div>
  )
}
