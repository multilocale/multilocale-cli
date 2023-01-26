/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const path = require('path')

function getFiles_(dir) {
  const subdirs = fs.readdirSync(dir)
  const files = subdirs.map(subdir => {
    const resource = path.resolve(dir, subdir)
    return fs.statSync(resource).isDirectory() ? getFiles(resource) : resource
  })
  return files.reduce((a, f) => a.concat(f), [])
}

module.exports = function getFiles(dir) {
  dir = dir || '.'
  let files = getFiles_(dir)

  files = files
    .map(file => file.replace(path.resolve('.'), ''))
    .filter(file => !file.startsWith('/.'))

  return files
}
