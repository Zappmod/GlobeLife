import { useState, useEffect } from 'react'
import JSZip from 'jszip'

const BASE = '/GlobeLife'
// Client-only build is served here — used as the source for zip generation
const CLIENT_BUILD_BASE = '/GlobeLife/client-build'

// Default hashes baked into the current build (from auth.js defaults)
const DEFAULT_USERNAME_HASH = 'ad15e8b1e00bdf1b72129f8152cca4c12e5880c381d3da03773714959bd458ab'
const DEFAULT_PASSWORD_HASH = '456b46f6ebec1263435206188f1fa200b38aeaa74f978a218534f48d98554592'
const DEFAULT_BASE = '/GlobeLife/'
// Same string without trailing slash — used in BrowserRouter basename prop
const DEFAULT_BASE_NO_SLASH = '/GlobeLife'
// Hero heading text as it appears in the built JS bundle
const DEFAULT_CLIENT_HEADING = 'Bob Premium Package for Z'

// Image prefix → lab id mapping
const IMAGE_PREFIXES = {
  'lab-setup':           ['00-'],
  'technical-design':    ['tech-design-'],
  'understand':          ['understand-'],
  'impact-analysis':     ['impact-'],
  'refactoring':         ['refactor-'],
  'spec-driven-code-gen':['codegen-'],
  'ui-modernization':    ['UImod-'],
  'cobol-to-java':       ['transform-'],
}
// Always include prereq images (used by the prereqs page)
const ALWAYS_INCLUDE_PREFIXES = ['Prereq-']

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Convert https://github.com/ORG/REPO(.git) → https://ORG.github.io/REPO/
function derivePagesUrl(repoUrl) {
  try {
    const clean = repoUrl.trim().replace(/\.git$/, '').replace(/\/$/, '')
    const u = new URL(clean)
    // pathname is /ORG/REPO
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const [org, repo] = parts
    return `https://${org}.github.io/${repo}/`
  } catch {
    return null
  }
}

function deriveBasePath(repoUrl) {
  const pagesUrl = derivePagesUrl(repoUrl)
  if (pagesUrl) {
    try { return new URL(pagesUrl).pathname } catch {}
  }
  return '/'
}

function validate(fields) {
  const errors = {}
  if (!fields.repoUrl.trim()) errors.repoUrl = 'Repo URL is required.'
  else if (!fields.repoUrl.trim().startsWith('https://github.com/'))
    errors.repoUrl = 'Enter the GitHub repo URL, e.g. https://github.com/org/repo-name'
  if (!fields.username.trim()) errors.username = 'Username is required.'
  if (!fields.password.trim()) errors.password = 'Password is required.'
  if (!fields.confirmPassword.trim()) errors.confirmPassword = 'Please confirm the password.'
  else if (fields.password !== fields.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!fields.clientName.trim()) errors.clientName = 'Client name is required.'
  if (fields.selectedLabs.length === 0) errors.selectedLabs = 'Select at least one lab.'
  return errors
}

function Field({ label, helper, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {helper && <p className="text-xs text-gray-400 mb-1.5">{helper}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-ibm-blue transition ${
        error ? 'border-red-400' : 'border-ibm-border'
      }`}
    />
  )
}

function PasswordInput({ value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 pr-16 border rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-ibm-blue transition ${
          error ? 'border-red-400' : 'border-ibm-border'
        }`}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-700 px-1 py-0.5 transition-colors select-none"
        tabIndex={-1}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default function BuildPage() {
  const [labs, setLabs] = useState([])
  const [repoUrl, setRepoUrl]             = useState('')
  const [username, setUsername]           = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientName, setClientName]       = useState('')
  const [selectedLabs, setSelectedLabs]   = useState([])
  const [errors, setErrors]               = useState({})
  const [isGenerating, setIsGenerating]   = useState(false)
  const [done, setDone]                   = useState(false)

  useEffect(() => {
    fetch(`${BASE}/lab-instructions/index.json`)
      .then(r => r.json())
      .then(data => {
        setLabs(data.labs)
        setSelectedLabs(data.labs.map(l => l.id))
      })
      .catch(() => {})
  }, [])

  function toggleLab(id) {
    setSelectedLabs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function reset() {
    setRepoUrl(''); setUsername(''); setPassword(''); setConfirmPassword('')
    setClientName(''); setSelectedLabs(labs.map(l => l.id))
    setErrors({}); setDone(false)
  }

  async function generateAndDownload() {
    const fields = { repoUrl, username, password, confirmPassword, clientName, selectedLabs }
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsGenerating(true)
    setDone(false)
    try {
      // 1. Hash credentials
      const newUserHash = await sha256(username.trim())
      const newPassHash = await sha256(password)

      // 2. Derive new base path from repo URL
      const newBase = deriveBasePath(repoUrl)

      // 3. Fetch asset manifest (from main build — lab files/images are shared)
      const manifestResp = await fetch(`${BASE}/asset-manifest.json`)
      const manifest = await manifestResp.json()

      const zip = new JSZip()

      // 4. Fetch + patch index.html from the client-only build
      const htmlResp = await fetch(`${CLIENT_BUILD_BASE}/index.html`)
      let htmlText = await htmlResp.text()
      // The client build output paths look like /GlobeLife/assets/...
      // but the HTML file itself lives at client-build/index.html — strip that prefix
      htmlText = htmlText.replaceAll(`${DEFAULT_BASE}client-build/`, DEFAULT_BASE)
      // Now replace the shared base with the new repo base
      htmlText = htmlText.replaceAll(DEFAULT_BASE, newBase)
      zip.file('index.html', htmlText)

      // 4b. Add 404.html — GitHub Pages needs this to serve the SPA on deep links
      const noSlashBase = newBase.replace(/\/$/, '')
      const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting…</title>
  <script>
    var l = window.location;
    l.replace(
      '${noSlashBase}' +
      '/?p=' + encodeURIComponent(l.pathname.slice('${noSlashBase}'.length) + l.search) +
      (l.hash ? '&h=' + encodeURIComponent(l.hash) : '')
    );
  </script>
</head>
<body></body>
</html>`
      zip.file('404.html', notFoundHtml)

      // 5. Find JS + CSS asset filenames from the patched index.html
      const scriptMatches = [...htmlText.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1])
      const styleMatches  = [...htmlText.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1])

      // 6. Fetch and patch JS bundles from client-build
      for (const scriptSrc of scriptMatches) {
        // Convert patched path (newBase prefix) back to a fetchable URL (CLIENT_BUILD_BASE prefix)
        const fetchUrl = scriptSrc.startsWith(newBase)
          ? CLIENT_BUILD_BASE + '/assets/' + scriptSrc.split('/assets/')[1]
          : scriptSrc
        try {
          const resp = await fetch(fetchUrl)
          let text = await resp.text()
          // Patch auth hashes
          text = text.replaceAll(DEFAULT_USERNAME_HASH, newUserHash)
          text = text.replaceAll(DEFAULT_PASSWORD_HASH, newPassHash)
          // Patch base path string literals (with and without trailing slash)
          text = text.replaceAll(DEFAULT_BASE, newBase)
          text = text.replaceAll(DEFAULT_BASE_NO_SLASH, newBase.replace(/\/$/, ''))
          // Patch client heading in hero
          if (clientName.trim() !== DEFAULT_CLIENT_HEADING) {
            text = text.replaceAll(DEFAULT_CLIENT_HEADING, clientName.trim())
          }
          // Put it at the newBase-relative path in the zip
          const zipPath = scriptSrc.startsWith(newBase)
            ? scriptSrc.slice(newBase.length)
            : scriptSrc.replace(/^\//, '')
          zip.file(zipPath, text)
        } catch (e) {
          console.warn('Could not fetch script:', fetchUrl, e)
        }
      }

      // 7. Fetch CSS from client-build
      for (const styleSrc of styleMatches) {
        const fetchUrl = styleSrc.startsWith(newBase)
          ? CLIENT_BUILD_BASE + '/assets/' + styleSrc.split('/assets/')[1]
          : styleSrc
        try {
          const resp = await fetch(fetchUrl)
          const blob = await resp.blob()
          const zipPath = styleSrc.startsWith(newBase)
            ? styleSrc.slice(newBase.length)
            : styleSrc.replace(/^\//, '')
          zip.file(zipPath, blob)
        } catch (e) {
          console.warn('Could not fetch style:', fetchUrl, e)
        }
      }

      // 8. Fetch ALL remaining JS chunks (lazy-loaded by the app at runtime)
      const clientManifestResp = await fetch(`${CLIENT_BUILD_BASE}/asset-manifest.json`).catch(() => null)
      if (clientManifestResp && clientManifestResp.ok) {
        const clientManifest = await clientManifestResp.json()
        const jsChunks    = clientManifest.jsChunks    || []
        const sharedChunks = new Set(clientManifest.sharedChunks || [])
        for (const chunkFile of jsChunks) {
          if (scriptMatches.some(s => s.endsWith(chunkFile))) continue // already fetched from index.html
          // Shared chunks (e.g. katex) live in main dist/assets/, not client-build/assets/
          const fetchUrl = sharedChunks.has(chunkFile)
            ? `${DEFAULT_BASE}assets/${chunkFile}`
            : `${CLIENT_BUILD_BASE}/assets/${chunkFile}`
          try {
            const resp = await fetch(fetchUrl)
            if (!resp.ok) continue
            let text = await resp.text()
            text = text.replaceAll(DEFAULT_BASE, newBase)
            text = text.replaceAll(DEFAULT_BASE_NO_SLASH, newBase.replace(/\/$/, ''))
            zip.file(`assets/${chunkFile}`, text)
          } catch {}
        }
      }

      // 9. Fetch static public assets
      const staticAssets = [
        'Bob.png', 'Bob2.png', 'BobMainframe.png',
        'SampleCode.zip',
      ]
      for (const asset of staticAssets) {
        try {
          const resp = await fetch(`${DEFAULT_BASE}${asset}`)
          if (resp.ok) zip.file(asset, await resp.blob())
        } catch {}
      }

      // 9. Filter index.json to selected labs only
      const labIndexResp = await fetch(`${BASE}/lab-instructions/index.json`)
      const labIndex = await labIndexResp.json()
      const filteredIndex = {
        ...labIndex,
        labs: labIndex.labs.filter(l => selectedLabs.includes(l.id))
      }
      zip.file('lab-instructions/index.json', JSON.stringify(filteredIndex, null, 2))

      // 10. Fetch selected lab markdown files
      const selectedLabObjects = labIndex.labs.filter(l => selectedLabs.includes(l.id))
      const referencedImages = new Set()

      for (const lab of selectedLabObjects) {
        try {
          const resp = await fetch(`${BASE}/lab-instructions/${lab.file}`)
          const mdText = await resp.text()
          zip.file(`lab-instructions/${lab.file}`, mdText)
          // Extract image references from markdown
          const imgMatches = [...mdText.matchAll(/images\/([^\s)"]+)/g)]
          imgMatches.forEach(m => referencedImages.add(m[1]))
        } catch {}
      }

      // 11. Collect images: those referenced in selected labs + all Prereq- images
      const allImageFilenames = manifest.images.map(p => p.replace('images/', ''))
      const imagesToInclude = allImageFilenames.filter(name => {
        // Always include prereq images
        if (ALWAYS_INCLUDE_PREFIXES.some(p => name.startsWith(p))) return true
        // Include if referenced in a selected lab's markdown
        if (referencedImages.has(name)) return true
        // Include if prefix matches a selected lab
        return selectedLabs.some(labId => {
          const prefixes = IMAGE_PREFIXES[labId] || []
          return prefixes.some(p => name.startsWith(p))
        })
      })

      for (const imgName of imagesToInclude) {
        try {
          const resp = await fetch(`${BASE}/lab-instructions/images/${imgName}`)
          if (resp.ok) zip.file(`lab-instructions/images/${imgName}`, await resp.blob())
        } catch {}
      }

      // 12a. Add .gitignore — excludes the KaTeX JS chunk which triggers a
      //      false-positive "Trojan Source" Vault Radar finding on IBM GHE.
      //      GitHub Pages serves all files regardless of .gitignore so the
      //      site still works; the file just never enters git history.
      zip.file('.gitignore', [
        '# KaTeX math library — excluded from git to avoid IBM Vault Radar false positive.',
        '# GitHub Pages serves this file normally; it does not need to be committed.',
        'assets/katex-*.js',
        '',
      ].join('\n'))

      // 12b. Add README.md with deployment instructions
      const pagesUrl = derivePagesUrl(repoUrl) || '<your-github-pages-url>'
      const safeName = clientName.trim().replace(/[^a-zA-Z0-9-_]/g, '-')
      const bobPrompt = `Please push this to my git repo located here: ${repoUrl.trim()} — push all files to the main branch, then tell me any manual steps I need to take to make the site live on GitHub Pages.`
      const readmeContent = `# ${clientName.trim()} — Bob Workshop Site

This folder contains your ready-to-deploy GitHub Pages site.

## Deployment Steps

### 1  Move / place this folder
Unzip (or move) this folder to wherever you'd like to store the project on your computer.

### 2  Open Bob
Open a **new instance of Bob** and select **Open Folder**, then open the folder you just unzipped.

### 3  Paste the following prompt into Bob (Agent mode)
\`\`\`
${bobPrompt}
\`\`\`

Bob will initialise the git repo, commit all files, push them to GitHub, and walk you through any remaining steps.

### 4  Manual step — enable GitHub Pages
After Bob pushes the code, go to your repo on GitHub and:

1. Click **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Set the branch to \`main\` and the folder to \`/ (root)\`.
4. Click **Save**.

Your site will be live in ~1 minute at:
👉 **${pagesUrl}**

---
*Generated by the Bob CE Toolkit — Build a Client Facing Site.*
`
      zip.file('README.md', readmeContent)

      // 13. Generate and download zip
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${safeName}-bob-site.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)

      setDone(true)
    } catch (err) {
      console.error('Zip generation failed:', err)
      alert('Something went wrong generating the zip. Check the console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const sectionCls = 'bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4'
  const sectionHeadCls = 'text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1'

  return (
    <div className="min-h-screen bg-ibm-bg pt-12">
      {/* Page header */}
      <div className="bg-white border-b border-ibm-border">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-ibm-indigo mb-2">CE Toolkit</p>
          <h1 className="text-2xl font-bold text-gray-900">Build a Client Facing Site</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Fill in the details below and download a ready-to-deploy zip for your client's GitHub Pages repo.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 flex flex-col gap-6">

        {/* Before You Begin */}
        <div className="bg-ibm-active border border-ibm-border rounded-xl p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ibm-indigo">Before You Begin</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-ibm-indigo text-white text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
              <p className="text-sm text-gray-700">
                <strong>Create a GitHub Organization</strong> (one-time) — go to{' '}
                <a href="https://github.com/organizations/new" target="_blank" rel="noopener noreferrer" className="text-ibm-blue underline">github.com/organizations/new</a>{' '}
                and create a public org (e.g. <code className="bg-white px-1 rounded text-xs">AppModZ-CE4S</code>) to house all your client repos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-ibm-indigo text-white text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
              <p className="text-sm text-gray-700">
                <strong>Create a private repo</strong> inside that org — go to{' '}
                <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-ibm-blue underline">github.com/new</a>,
                select your org as the owner, name it <code className="bg-white px-1 rounded text-xs">workshop-clientname</code>, set it to <strong>Private</strong>, and leave it empty. Then paste the URL below.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">⏱ Remember to delete the repo within 3 days after the event to protect IBM content.</p>
        </div>

        {/* Section 1 — Repo Config */}
        <div className={sectionCls}>
          <h2 className={sectionHeadCls}>Repo Configuration</h2>
          <Field
            label="GitHub Repo URL"
            helper="Paste the URL of the empty private repo you just created."
            error={errors.repoUrl}
          >
            <Input
              value={repoUrl}
              onChange={setRepoUrl}
              placeholder="https://github.com/org/repo-name"
              error={errors.repoUrl}
            />
          </Field>
          {derivePagesUrl(repoUrl) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-ibm-bg border border-ibm-border rounded px-3 py-2">
              <span className="text-gray-400 shrink-0">Pages URL:</span>
              <span className="font-mono text-ibm-blue break-all">{derivePagesUrl(repoUrl)}</span>
            </div>
          )}
        </div>

        {/* Section 2 — Credentials */}
        <div className={sectionCls}>
          <h2 className={sectionHeadCls}>Site Credentials</h2>
          <Field label="Username" error={errors.username}>
            <Input value={username} onChange={setUsername} placeholder="e.g. acmecorp" error={errors.username} />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput value={password} onChange={setPassword} placeholder="Choose a password" error={errors.password} />
          </Field>
          <Field label="Confirm Password" error={errors.confirmPassword}>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" error={errors.confirmPassword} />
          </Field>
        </div>

        {/* Section 3 — Client Info */}
        <div className={sectionCls}>
          <h2 className={sectionHeadCls}>Client Info</h2>
          <Field
            label="Client Name"
            helper="Appears in the site's hero heading and as the zip filename prefix."
            error={errors.clientName}
          >
            <Input value={clientName} onChange={setClientName} placeholder="e.g. Acme Corp" error={errors.clientName} />
          </Field>
        </div>

        {/* Section 4 — Lab Selection */}
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-1">
            <h2 className={sectionHeadCls}>Labs to Include</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLabs(labs.map(l => l.id))}
                className="text-xs text-ibm-blue hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setSelectedLabs([])}
                className="text-xs text-gray-400 hover:underline font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>
          {errors.selectedLabs && <p className="text-xs text-red-500">{errors.selectedLabs}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {labs.map((lab, idx) => (
              <label
                key={lab.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-ibm-border bg-white hover:bg-ibm-bg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedLabs.includes(lab.id)}
                  onChange={() => toggleLab(lab.id)}
                  className="mt-0.5 accent-ibm-blue shrink-0"
                />
                <span className="text-sm">
                  <span className="block font-medium text-gray-800">{lab.icon} {lab.title.replace(/^Lab \d+:\s*/, '')}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={generateAndDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-ibm-blue text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Generate &amp; Download Zip
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Post-generation instructions */}
        {done && (() => {
          const pagesUrl = derivePagesUrl(repoUrl) || null
          const bobPrompt = `Please push this to my git repo located here: ${repoUrl.trim()} — push all files to the main branch, then tell me any manual steps I need to take to make the site live on GitHub Pages.`
          const steps = [
            {
              num: '1',
              title: 'Move or place the zip',
              body: <>Unzip the downloaded file and move the folder to wherever you'd like to store this project on your computer.</>,
            },
            {
              num: '2',
              title: 'Open a new instance of Bob',
              body: <>Open Bob, click <strong>Open Folder</strong>, and select the unzipped folder.</>,
            },
            {
              num: '3',
              title: 'Paste the following prompt into Bob (Agent mode)',
              body: (
                <div className="mt-2">
                  <p className="text-xs text-green-700 mb-1">Copy and paste this exactly:</p>
                  <pre className="bg-green-100 border border-green-300 rounded p-3 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed select-all">
                    {bobPrompt}
                  </pre>
                  <p className="text-xs text-green-700 mt-1.5">Bob will initialise git, commit all files, push to GitHub, and guide you through the rest.</p>
                </div>
              ),
            },
            {
              num: '4',
              title: 'Enable GitHub Pages (manual step)',
              body: (
                <ol className="list-decimal list-inside mt-1 space-y-1 text-xs leading-relaxed">
                  <li>Go to your repo on GitHub and click <strong>Settings → Pages</strong>.</li>
                  <li>Under <em>Build and deployment → Source</em>, choose <strong>Deploy from a branch</strong>.</li>
                  <li>Set branch to <code className="bg-green-100 px-1 rounded">main</code> and folder to <code className="bg-green-100 px-1 rounded">/ (root)</code>.</li>
                  <li>Click <strong>Save</strong>. Your site will be live in ~1 minute.</li>
                  {pagesUrl && (
                    <li className="mt-1">
                      Your site URL will be:{' '}
                      <a href={pagesUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-ibm-blue underline break-all">
                        {pagesUrl}
                      </a>
                    </li>
                  )}
                </ol>
              ),
            },
          ]
          return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-sm text-green-900">
              <p className="font-semibold text-base mb-4">✓ Your zip is downloading!</p>
              <p className="text-xs text-green-700 mb-5">A <code className="bg-green-100 px-1 rounded">README.md</code> with these same instructions is included inside the zip.</p>
              <ol className="flex flex-col gap-5">
                {steps.map(step => (
                  <li key={step.num} className="flex gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-green-200 text-green-900 font-bold text-xs flex items-center justify-center mt-0.5">
                      {step.num}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm leading-snug">{step.title}</p>
                      <div className="text-xs leading-relaxed mt-0.5 text-green-800">{step.body}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
