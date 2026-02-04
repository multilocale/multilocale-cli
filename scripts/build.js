/* Copyright 2013 - 2024 Waiterio LLC */
const esbuild = require('esbuild')
const path = require('path')
const fs = require('fs')
const packageJson = require('../package.json')

const distDir = path.resolve(__dirname, '../dist')

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true })
}
fs.mkdirSync(distDir, { recursive: true })

// External dependencies that will be installed from npm
const external = Object.keys(packageJson.dependencies || {})

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, '../index.js')],
    bundle: true,
    platform: 'node',
    target: 'node12',
    outfile: path.resolve(distDir, 'index.js'),
    format: 'cjs',
    external,
    // The source index.js already has #!/usr/bin/env node shebang
    // esbuild will preserve it at the top of the bundle
    minify: false,
    sourcemap: false,
  })
  .then(() => {
    console.log('Build completed successfully!')
    console.log(`Output: ${path.resolve(distDir, 'index.js')}`)
  })
  .catch(error => {
    console.error('Build failed:', error)
    process.exit(1)
  })
