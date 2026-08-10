#!/usr/bin/env node
/**
 * Copies dist-client/ into dist/client-build/ so the client zip assets
 * are served at /GlobeLife/client-build/ on the live site.
 *
 * GitHub Pages does NOT support symlinks, so all files are real copies.
 * The only exception is katex-C5jXJg4s.js which triggers a Block Secrets
 * false positive — it is excluded from client-build/ because it is already
 * committed in dist/assets/ and served from the same base path.  The zip
 * generator fetches it directly from the main assets path instead.
 *
 * Also writes asset-manifest.json listing all JS chunks (including the
 * katex filename so the zip generator knows to fetch it from main assets).
 *
 * Renames index.client.html → index.html.
 */
import { cpSync, rmSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Files already committed in dist/assets/ that must not be re-copied
// (they trigger Block Secrets false positives on new paths)
const EXCLUDE_FROM_COPY = new Set(['katex-C5jXJg4s.js'])

const __dirname  = dirname(fileURLToPath(import.meta.url))
const src        = join(__dirname, '..', 'dist-client')
const dest       = join(__dirname, '..', 'dist', 'client-build')

rmSync(dest, { recursive: true, force: true })
mkdirSync(join(dest, 'assets'), { recursive: true })

const clientAssets = join(src, 'assets')
const allJsChunks  = []   // every JS chunk name (including excluded ones)
const copiedChunks = []   // chunks actually copied into client-build/

for (const file of readdirSync(clientAssets)) {
  if (file.endsWith('.js')) allJsChunks.push(file)
  if (EXCLUDE_FROM_COPY.has(file)) continue   // skip — already in dist/assets/
  cpSync(join(clientAssets, file), join(dest, 'assets', file))
  if (file.endsWith('.js')) copiedChunks.push(file)
}

// asset-manifest.json: tells zip generator every chunk name + which are
// "shared" (served from main /assets/ rather than /client-build/assets/)
writeFileSync(
  join(dest, 'asset-manifest.json'),
  JSON.stringify({
    jsChunks: allJsChunks,
    sharedChunks: [...EXCLUDE_FROM_COPY].filter(f => f.endsWith('.js')),
  }, null, 2)
)

// Copy + rename HTML entry point
cpSync(join(src, 'index.client.html'), join(dest, 'index.html'))

const skipped = allJsChunks.length - copiedChunks.length
console.log(`✓ dist-client/ copied to dist/client-build/ (${allJsChunks.length} JS chunks, ${skipped} shared/excluded)`)
