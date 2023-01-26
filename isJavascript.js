/* Copyright 2013 - 2022 Waiterio LLC */

const getFiles = require('./getFiles.js')

module.exports = function getAndroidManifest() {
  let files = getFiles()
  files = files.filter(file => file.endsWith('package.json'))

  return files.length > 0
}
