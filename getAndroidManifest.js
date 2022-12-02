/* Copyright 2013 - 2022 Waiterio LLC */

import getFiles from './getFiles.js'

export default async function getAndroidManifest() {
  let files = await getFiles()
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('AndroidManifest.xml'))

  return files[0]
}
