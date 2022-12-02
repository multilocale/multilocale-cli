/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs'
import { promisify } from 'util'
import getFiles from './getFiles.js'

export default async function getMultilocaleJson() {
  let multilocaleJson
  let files = await getFiles()
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('multilocale.json'))

  if (files.length > 0) {
    let multilocaleJsonPath = files[0]

    if (multilocaleJsonPath.startsWith('/')) {
      multilocaleJsonPath = multilocaleJsonPath.slice(1)
    }

    multilocaleJson = await promisify(fs.readFile)(multilocaleJsonPath, 'utf8')
    multilocaleJson = multilocaleJson || '{}'
    multilocaleJson = JSON.parse(multilocaleJson)
  }

  return multilocaleJson
}
