/* Copyright 2013 - 2022 Waiterio LLC */

import getFiles from './getFiles.js'

export default function getAndroidManifest() {
  let files = getFiles()
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('AndroidManifest.xml'))

  return files[0]
}
