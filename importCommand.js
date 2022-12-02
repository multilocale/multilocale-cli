/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import commander from 'commander'
import { toJson } from 'xml2json'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import login from './login.js'

async function getFiles(dir) {
  const readdir = promisify(fs.readdir)
  const stat = promisify(fs.stat)
  const subdirs = await readdir(dir)
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const resource = path.resolve(dir, subdir)
      return (await stat(resource)).isDirectory()
        ? getFiles(resource)
        : resource
    }),
  )
  return files.reduce((a, f) => a.concat(f), [])
}

function getAndroidManifest(files) {
  files = files.filter(file => !file.includes('/build/'))
  files = files.filter(file => file.endsWith('AndroidManifest.xml'))

  return files[0]
}

function isAndroid(files) {
  return !!getAndroidManifest(files)
}

function importCommand() {
  const command = new commander.Command('import')
  command.action(async () => {
    console.log('import into multilocale.com')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    let files = await getFiles('.')
    files = files
      .map(file => file.replace(path.resolve('.'), ''))
      .filter(file => !file.startsWith('/.'))

    if (isAndroid(files)) {
      let androidManifestPath = getAndroidManifest(files)
      console.log({ androidManifestPath })
      let stringsXmlPath = path.resolve(
        androidManifestPath.replace(
          'AndroidManifest.xml',
          'res/values/strings.xml',
        ),
      )

      if (stringsXmlPath.startsWith('/')) {
        stringsXmlPath = stringsXmlPath.slice(1)
      }

      let stringsXml = await promisify(fs.readFile)(stringsXmlPath, 'utf8')

      console.log({ stringsXml })

      let stringsJson = JSON.parse(toJson(stringsXml))

      console.log(stringsJson)
      let locale = 'en'

      let translatablesImported = stringsJson.resources.string.map(
        ({ name, $t }) => ({
          key: name,
          value: $t,
          locale,
        }),
      )

      console.log(`Found ${translatablesImported.length} translatables`)
    }
  })

  return command
}

export default importCommand
