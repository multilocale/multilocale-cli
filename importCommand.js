/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const path = require('path')
const commander = require('commander')
const { toJson } = require('xml2json')
const addTranslatables = require('@multilocale/multilocale-js-client/addTranslatables.js')
const translateString = require('@multilocale/multilocale-js-client/translateString.js')
const uuid = require('@multilocale/multilocale-js-client/uuid.js')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const getAndroidResPath = require('./getAndroidResPath.js')
const isAndroid = require('./isAndroid.js')
const isJavascript = require('./isJavascript.js')
const getFiles = require('./getFiles.js')
const getProject = require('./getProject.js')
const login = require('./login.js')

function importCommand() {
  const command = new commander.Command('import')
  command.option('--project [project]', 'project id or name')
  command.action(async options => {
    try {
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
      } else if (isJavascript()) {
        console.log('Javascript project detected')

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

                let value = json[key]

                if (!value && language === defaultLocale) {
                  value = key
                }

                if (value) {
                  let translatable = {
                    _id: uuid(),
                    key,
                    value,
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
                }
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

                let translation

                try {
                  let result = await translateString({ string, to, from })
                  translation = result.translation
                } catch (error) {
                  throw new Error(`Could not translate '${string}' from ${from} to ${to}`)
                }

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
    } catch (error) {
      console.log(error)
    }
  })

  return command
}

module.exports = importCommand
