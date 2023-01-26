/* Copyright 2013 - 2022 Waiterio LLC */

const getFiles = require('./getFiles.js')

module.exports = function getAndroidManifest() {
  let files = getFiles()
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('AndroidManifest.xml'))

  return files[0]
}
