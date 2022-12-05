/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs-extra'
import getFiles from './getFiles.js'

export default function getMultilocaleJson() {
  let multilocaleJson
  let files = getFiles()
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('multilocale.json'))

  if (files.length > 0) {
    let multilocaleJsonPath = files[0]

    if (multilocaleJsonPath.startsWith('/')) {
      multilocaleJsonPath = multilocaleJsonPath.slice(1)
    }

    multilocaleJson = fs.readFileSync(multilocaleJsonPath, 'utf8')
    multilocaleJson = multilocaleJson || '{}'
    multilocaleJson = JSON.parse(multilocaleJson)
  }

  return multilocaleJson
}
