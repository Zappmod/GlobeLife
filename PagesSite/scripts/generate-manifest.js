#!/usr/bin/env node
/**
 * Generates public/asset-manifest.json listing all lab-instructions files.
 * Run via: npm run manifest  (also runs automatically as prebuild)
 * Uses CommonJS via .cjs extension to avoid ESM issues.
 */
import { readdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const publicDir = join(__dirname, '..', 'public', 'lab-instructions')
const outFile   = join(__dirname, '..', 'public', 'asset-manifest.json')

function walkDir(dir, base) {
  const entries = readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const entry of entries) {
    const rel = (base ? base + '/' : '') + entry.name
    if (entry.isDirectory()) {
      files = files.concat(walkDir(join(dir, entry.name), rel))
    } else {
      files.push(rel)
    }
  }
  return files
}

const all      = walkDir(publicDir, '')
const labFiles = all.filter(f => f.endsWith('.md'))
const images   = all.filter(f => f.startsWith('images/'))

writeFileSync(outFile, JSON.stringify({ labFiles, images }, null, 2))
console.log(`✓ asset-manifest.json written (${labFiles.length} lab files, ${images.length} images)`)
