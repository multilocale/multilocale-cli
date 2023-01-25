/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs-extra'
import path from 'path'
import commander from 'commander'
import { toJson } from 'xml2json'
import addTranslatables from '@multilocale/multilocale-js-client/addTranslatables.js'
import translateString from '@multilocale/multilocale-js-client/translateString.js'
import uuid from '@multilocale/multilocale-js-client/uuid.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getAndroidResPath from './getAndroidResPath.js'
import isAndroid from './isAndroid.js'
import isGatsby from './isGatsby.js'
import getFiles from './getFiles.js'
import getProject from './getProject.js'
import login from './login.js'

function importCommand() {
  const command = new commander.Command('import')
  command.option('--project [project]', 'project id or name')
  command.action(async options => {
    console.log('import into multilocale.com')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    let project = await getProject(options?.project)
    let defaultLocale = project.defaultLocale || 'en'

    if (isAndroid()) {
      console.log('Android project detected')

      let files = getFiles()
      files = files.filter(file => file.endsWith('strings.xml'))

      console.log(`Found ${files.length} languages`)

      let translatables = []

      for (let f = 0; f < files.length; f += 1) {
        let file = files[f]
        let language = defaultLocale
        if (file.includes('/values-')) {
          language = file.split('/values-')[1].split('/')[0] // eslint-disable-line
        }

        let androidResPath = getAndroidResPath()
        let stringsXmlPath = path.resolve(androidResPath, 'values/strings.xml')
        let stringsXml = fs.readFileSync(stringsXmlPath, 'utf8')

        // console.log({ stringsXml })

        let stringsJson = JSON.parse(toJson(stringsXml))

        // console.log(stringsJson)

        let translatablesForLanguage = stringsJson.resources.string.map(
          ({ name, $t }) => ({
            _id: uuid(),
            key: name,
            value: $t,
            language,
            creationTime: new Date().toISOString(),
            lastEditTime: new Date().toISOString(),
            googleTranslate: false,
            imported: true,
            organizationId: project.organizationId,
            projects: [project.name],
          }),
        )

        console.log(
          `${language}: Found ${translatablesForLanguage.length} translatables`,
        )

        translatables = translatables.concat(translatablesForLanguage)
      }

      await addTranslatables(translatables)

      console.log(
        `Added ${translatables.length} translatables: https://app.multilocale.com/projects/${project._id}`,
      )
    } else if (isGatsby()) {
      console.log('Gatsby project detected')

      let files = getFiles()
      const { locales, paths } = project
      console.log({ locales, paths })

      const locale2files = {}
      paths.forEach(path_ => {
        if (path_.includes('%lang%')) {
          locales.forEach(locale => {
            const suffix = path_.replace('%lang%', locale)
            const matchingFiles = files.filter(file => file.endsWith(suffix))

            if (matchingFiles.length === 0) {
              console.log(
                `No matching files for path ${path_} and locale ${locale}`,
              )
            } else {
              if (!locale2files[locale]) {
                locale2files[locale] = []
              }

              if (matchingFiles.length === 1) {
                locale2files[locale].push(matchingFiles[0])
              } else if (matchingFiles.length > 1) {
                console.log(
                  `Found multiple matching files for path ${path_} and locale ${locale}:`,
                )
                matchingFiles.forEach(matchingFile => {
                  console.log(`  ${matchingFile}`)
                  locale2files[locale].push(matchingFile)
                })
              }
            }
          })
        } else {
          console.log(`Path ${path_} does not include %lang%`)
        }
      })

      const localesFound = Object.keys(locale2files)
      const filesFound = Object.values(locale2files).flat()

      if (filesFound.length > 0) {
        console.log(
          `Found ${filesFound.length} files in ${localesFound.length} locales:`,
        )
        filesFound.forEach(fileFound => console.log(`  ${fileFound}`))

        let key2locale2translatable = {}

        for (let l = 0; l < localesFound.length; l += 1) {
          let locale = localesFound[l]
          let files = locale2files[locale]

          for (let f = 0; f < files.length; f += 1) {
            let file = files[f]

            if (file.startsWith('/')) {
              file = file.substring(1)
            }

            let filePath = path.resolve(file)

            let fileString = fs.readFileSync(filePath, 'utf8')

            // console.log({ fileString })

            let extension = path.extname(file)
            // console.log({ extension })

            let json

            if (extension === '.json') {
              json = JSON.parse(fileString)
            } else if (!extension === '.json') {
              throw new Error(
                `It was not possible to detect the extension of ${file}`,
              )
            } else {
              throw new Error(
                `Unsupported file extension ${extension} for file ${file}`,
              )
            }

            let keys = Object.keys(json)

            const language = locale
            let translatablesForLanguage = 0

            keys.forEach(key => {
              if (!key2locale2translatable[key]) {
                key2locale2translatable[key] = {}
              }

              let translatable = {
                _id: uuid(),
                key,
                value: json[key],
                language,
                creationTime: new Date().toISOString(),
                lastEditTime: new Date().toISOString(),
                googleTranslate: false,
                imported: true,
                organizationId: project.organizationId,
                projects: [project.name],
                projectsIds: [project._id],
              }

              key2locale2translatable[key][locale] = translatable
              translatablesForLanguage += 1
            })

            console.log(
              `${language}: Found ${translatablesForLanguage} translatables`,
            )
          }
        }

        let keys = Object.keys(key2locale2translatable)

        for (let k = 0; k < keys.length; k += 1) {
          let key = keys[k]
          let locales = Object.keys(key2locale2translatable[key])

          if (locales.length === 0) {
            throw new Error(`key ${key} has no locales`)
          }

          let from = defaultLocale

          if (!key2locale2translatable[key][defaultLocale]) {
            from = locales[0]
          }

          for (let l = 0; l < project.locales.length; l += 1) {
            let to = project.locales[l]
            if (!locales.includes(to)) {
              let translatableFrom = key2locale2translatable[key][from]
              let string = translatableFrom.value
              let { translation } = await translateString({ string, to, from })

              let translatableTo = {
                _id: uuid(),
                key,
                value: translation,
                language: to,
                creationTime: new Date().toISOString(),
                lastEditTime: new Date().toISOString(),
                googleTranslate: true,
                organizationId: project.organizationId,
                projects: [project.name],
                projectsIds: [project._id],
              }

              console.log(`${to}: translated key ${key} to ${translation}`)

              key2locale2translatable[key][to] = translatableTo
            }
          }
        }

        let translatables = Object.keys(key2locale2translatable).reduce(
          (translatables, key) => {
            return translatables.concat(
              Object.values(key2locale2translatable[key]),
            )
          },
          [],
        )

        await addTranslatables(translatables)

        console.log(
          `Added ${translatables.length} translatables: https://app.multilocale.com/projects/${project._id}`,
        )
      } else {
        console.log('Could not find any file matching paths in project')
      }

      let translatables = []
    } else {
      console.log('Could not detect project type')
    }
  })

  return command
}

export default importCommand
