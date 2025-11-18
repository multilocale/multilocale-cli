/* Copyright 2013 - 2022 Waiterio LLC */
const commander = require('commander')
const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('node:path')
const getPhrases = require('@multilocale/multilocale-js-client/getPhrases.js')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const getAndroidResPath = require('./getAndroidResPath.js')
const getExtension = require('./getExtension.js')
const getFormat = require('./getFormat.js')
const getHeader = require('./getHeader.js')
const getProject = require('./getProject.js')
const getPostScript = require('./getPostScript.js')
const isAndroid = require('./isAndroid.js')
const login = require('./login.js')

function sortObject(o) {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => {
      r[k] = o[k]
      return r
    }, {})
}

function downloadCommand() {
  const command = new commander.Command('download')
  command.option('--project [project]', 'project id or name')
  command.option('--format [format]', 'format of dictionary files')
  command.option('--extension [extension]', 'extension of dictionary files')
  command.option('--header [header]', 'header of dictionary files')
  command.option(
    '--post-script [post-script]',
    'post-script to run after downloading dictionary files',
  )
  command.action(async options => {
    try {
      console.log('download')

      rehydrateSession()

      if (!isLoggedInSession()) {
        await login()
      }

      let project = await getProject(options)
      let format = await getFormat(options)
      let extension = await getExtension(options)
      let header = await getHeader(options)
      let postScript = await getPostScript(options)

      console.log(`Project: ${project.name} (${project._id})`)
      console.log(`Format: ${format}`)
      console.log(`Extension: ${extension}`)

      if (header) {
        console.log(
          `Header: ${header.replaceAll('\n', '\\n').replaceAll('\r', '\\r').replaceAll('\t', '\\t')}`,
        )
      }

      if (postScript) {
        console.log(`Post-script: ${postScript}`)
      }

      const phrases = await getPhrases({
        project: project.name,
      })
      console.log(`Found ${phrases?.length ?? 0} phrases`)

      if (isAndroid()) {
        console.log('Android project detected')
        const androidResPath = getAndroidResPath()

        const language2key2value = phrases.reduce(
          (language2key2value, phrase) => {
            if (!language2key2value[phrase.language]) {
              language2key2value[phrase.language] = {
                locale: phrase.language,
              }
            }
            language2key2value[phrase.language][phrase.key] = phrase.value
            return language2key2value
          },
          {},
        )
        // console.log('language2key2value', language2key2value)
        const languages = Object.keys(language2key2value).sort()

        console.log(`Found ${languages?.length ?? 0} languages`)

        for (let l = 0; l < languages.length; l += 1) {
          const language = languages[l]
          const key2value = sortObject(language2key2value[language])
          const keys = Object.keys(key2value)
          const stringsXml =
            // '/* DO NOT EDIT MANUALLY */\n' +
            // `/* Edit at https://app.multilocale.com/projects/${project._id} */\n` +
            // '/* Download translation files with https://github.com/multilocale/multilocale-cli */\n' +
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<resources>\n' +
            keys.reduce((string, key) => {
              const value = key2value[key] || ''

              string += `<string name="${key}">${value}</string>\n`

              return string
            }, '') +
            '</resources>\n'

          const folderPath =
            language === 'en'
              ? path.resolve(androidResPath, 'values')
              : path.resolve(androidResPath, `values-${language}`)

          // console.log({ folderPath })

          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
          }
          const stringsXmlPath = path.resolve(folderPath, 'strings.xml')

          // console.log({ stringsXmlPath })

          const stringXmlPretty = stringsXml

          // console.log({ stringXmlPretty })

          fs.writeFileSync(stringsXmlPath, stringXmlPretty)
          console.log(
            `${language}: ${stringsXmlPath.replace(path.resolve('.'), '')}`,
          )
        }
      } else {
        const language2key2value = phrases.reduce(
          (language2key2value, phrase) => {
            if (!language2key2value[phrase.language]) {
              language2key2value[phrase.language] = {
                locale: phrase.language,
              }
            }
            language2key2value[phrase.language][phrase.key] = phrase.value
            return language2key2value
          },
          {},
        )

        let { locales, paths } = project

        if (!paths) {
          paths = [`translations/%lang%.${extension}`]
        }

        paths.forEach(path_ => {
          if (path_.includes('%lang%')) {
            locales.forEach(language => {
              const phrasesDictionaryPath = path.resolve(
                path_.replace('%lang%', language),
              )
              const key2value = sortObject(language2key2value[language])

              fs.mkdirSync(path.dirname(phrasesDictionaryPath), {
                recursive: true,
              })

              let dictionaryFileContent = ''

              if (header) {
                dictionaryFileContent += `${header}`
              }

              if (format === 'json') {
                dictionaryFileContent += JSON.stringify(key2value, null, 2)
              } else if (format === 'esm') {
                dictionaryFileContent += `export default ${JSON.stringify(key2value, null, 2)}`
              } else if (format === 'js') {
                dictionaryFileContent += `module.exports = ${JSON.stringify(key2value, null, 2)}`
              } else if (format === 'cjs') {
                dictionaryFileContent += `module.exports = ${JSON.stringify(key2value, null, 2)}`
              }

              dictionaryFileContent += '\n'

              fs.writeFileSync(phrasesDictionaryPath, dictionaryFileContent)

              console.log(
                `  ${language}: ${phrasesDictionaryPath.replace(
                  path.resolve('.'),
                  '',
                )}`,
              )
            })
          } else {
            console.log(`Path ${path_} does not include %lang%`)
          }
        })

        if (postScript) {
          console.log(`Running post-script: ${postScript}`)
          execSync(postScript, { stdio: 'inherit' })
          console.log('Post-script completed')
        }

        // let indexJS = ''
        // languages.forEach(language => {
        //   indexJS += `const ${language} = require('./${language}.json'\n`)
        // })
        // indexJS += '\nmodule.exports = {\n'
        // languages.forEach(language => {
        //   indexJS += `  ${language},\n`
        // })
        // indexJS += '}\n'
        // fs.mkdirsSync(path.resolve('./translations'))
        // fs.writeFileSync(path.resolve('./translations/index), indexJS)
        // let languagesJS = 'module.exports = [\n'
        // languages.forEach(language => {
        //   languagesJS += `  '${language}',\n`
        // })
        // languagesJS += ']\n'
        // fs.writeFileSync(
        //   path.resolve('./translations/languages),
        //   languagesJS,
        // )

        console.log('Download completed')
      }
    } catch (error) {
      console.log('error', error)
    }
  })

  return command
}

module.exports = downloadCommand
