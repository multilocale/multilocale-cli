/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const path = require('node:path')
const commander = require('commander')
const xml2js = require('xml2js')
const addPhrases = require('@multilocale/multilocale-js-client/addPhrases.js')
const translateString = require('@multilocale/multilocale-js-client/translateString.js')
const uuid = require('@multilocale/multilocale-js-client/uuid.js')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const _getAndroidResPath = require('./getAndroidResPath.js')
const isAndroid = require('./isAndroid.js')
const isJavascript = require('./isJavascript.js')
const getFiles = require('./getFiles.js')
const getProject = require('./getProject.js')
const login = require('./login.js')

function convertXmlStringToJson(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

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

      const project = await getProject(options)
      const defaultLocale = project.defaultLocale || 'en'

      if (isAndroid()) {
        console.log('Android project detected')

        let files = getFiles()
        files = files.filter(file => file.endsWith('strings.xml'))

        console.log(`Found ${files.length} languages`)

        let phrases = []

        for (let f = 0; f < files.length; f += 1) {
          const file = files[f]
          let language = defaultLocale
          if (file.includes('/values-')) {
            language = file.split('/values-')[1].split('/')[0] // eslint-disable-line
          }

          let stringsXmlPath = path.resolve(file)
          if (stringsXmlPath.startsWith('/')) {
            stringsXmlPath = stringsXmlPath.slice(1)
          }
          // console.log({ stringsXmlPath })
          const stringsXml = fs.readFileSync(stringsXmlPath, 'utf8')

          // console.log({ stringsXml })

          const stringsJson = await convertXmlStringToJson(stringsXml)

          // console.log(JSON.stringify(stringsJson, null, 2))

          const phrasesForLanguage = stringsJson.resources.string.map(
            ({ $: { name }, _ }) => ({
              _id: uuid(),
              key: name,
              value: _,
              language,
              creationTime: new Date().toISOString(),
              lastEditTime: new Date().toISOString(),
              googleTranslate: false,
              imported: true,
              organizationId: project.organizationId,
              projects: [project.name],
            }),
          )

          console.log(`${language}: Found ${phrasesForLanguage.length} phrases`)

          phrases = phrases.concat(phrasesForLanguage)
        }

        // console.log({ phrases })

        await addPhrases(phrases)

        console.log(
          `Added ${phrases.length} phrases: https://app.multilocale.com/projects/${project._id}`,
        )
      } else if (isJavascript()) {
        console.log('Javascript project detected')

        const files = getFiles()
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

          const key2locale2phrase = {}

          for (let l = 0; l < localesFound.length; l += 1) {
            const locale = localesFound[l]
            const files = locale2files[locale]

            for (let f = 0; f < files.length; f += 1) {
              let file = files[f]

              if (file.startsWith('/')) {
                file = file.substring(1)
              }

              const filePath = path.resolve(file)

              const fileString = fs.readFileSync(filePath, 'utf8')

              // console.log({ fileString })

              const extension = path.extname(file)
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

              const keys = Object.keys(json)

              const language = locale
              let phrasesForLanguage = 0

              keys.forEach(key => {
                if (!key2locale2phrase[key]) {
                  key2locale2phrase[key] = {}
                }

                let value = json[key]

                if (!value && language === defaultLocale) {
                  value = key
                }

                if (value) {
                  const phrase = {
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

                  key2locale2phrase[key][locale] = phrase
                  phrasesForLanguage += 1
                }
              })

              console.log(`${language}: Found ${phrasesForLanguage} phrases`)
            }
          }

          const keys = Object.keys(key2locale2phrase)

          for (let k = 0; k < keys.length; k += 1) {
            const key = keys[k]
            const locales = Object.keys(key2locale2phrase[key])

            if (locales.length === 0) {
              throw new Error(`key ${key} has no locales`)
            }

            let from = defaultLocale

            if (!key2locale2phrase[key][defaultLocale]) {
              from = locales[0]
            }

            for (let l = 0; l < project.locales.length; l += 1) {
              const to = project.locales[l]
              if (!locales.includes(to)) {
                const phraseFrom = key2locale2phrase[key][from]
                const string = phraseFrom.value

                let translation

                try {
                  const result = await translateString({ string, to, from })
                  translation = result.translation
                } catch (_error) {
                  throw new Error(
                    `Could not translate '${string}' from ${from} to ${to}`,
                  )
                }

                const phraseTo = {
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

                key2locale2phrase[key][to] = phraseTo
              }
            }
          }

          const phrases = Object.keys(key2locale2phrase).reduce(
            (phrases, key) => {
              return phrases.concat(Object.values(key2locale2phrase[key]))
            },
            [],
          )

          await addPhrases(phrases)

          console.log(
            `Added ${phrases.length} phrases: https://app.multilocale.com/projects/${project._id}`,
          )
        } else {
          console.log('Could not find any file matching paths in project')
        }
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
