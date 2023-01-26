/* Copyright 2013 - 2022 Waiterio LLC */
const commander = require('commander')
const fs = require('fs-extra')
const path = require('path')
const getTranslatables = require('@multilocale/multilocale-js-client/getTranslatables.js')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const getAndroidResPath = require('./getAndroidResPath.js')
const getProject = require('./getProject.js')
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
  command.action(async options => {
    try {
      console.log('download')

      rehydrateSession()

      if (!isLoggedInSession()) {
        await login()
      }

      let project = await getProject(options?.project)

      let translatables = await getTranslatables({
        project: project.name,
      })
      console.log(`Found ${translatables?.length ?? 0} translatables`)

      if (isAndroid()) {
        console.log('Android project detected')
        let androidResPath = getAndroidResPath()

        let language2key2value = translatables.reduce(
          (language2key2value, translatable) => {
            if (!language2key2value[translatable.language]) {
              language2key2value[translatable.language] = {
                locale: translatable.language,
              }
            }
            language2key2value[translatable.language][translatable.key] =
              translatable.value
            return language2key2value
          },
          {},
        )
        // console.log('language2key2value', language2key2value)
        let languages = Object.keys(language2key2value).sort()

        console.log(`Found ${languages?.length ?? 0} languages`)

        for (let l = 0; l < languages.length; l += 1) {
          let language = languages[l]
          let key2value = sortObject(language2key2value[language])
          let keys = Object.keys(key2value)
          const stringsXml =
            '/* DO NOT EDIT MANUALLY */\n' +
            `/* Edit at https://app.multilocale.com/projects/${project._id} */\n` +
            '/* Download translation files with https://github.com/multilocale/multilocale-cli */\n' +
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<resources>\n' +
            keys.reduce((string, key) => {
              let value = key2value[key] || ''

              string += `<string name="${key}">${value}</string>\n`

              return string
            }, '') +
            '</resources>\n'

          let folderPath =
            language === 'en'
              ? path.resolve(androidResPath, 'values')
              : path.resolve(androidResPath, `values-${language}`)

          // console.log({ folderPath })

          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath)
          }
          let stringsXmlPath = path.resolve(folderPath, 'strings.xml')

          // console.log({ stringsXmlPath })

          let stringXmlPretty = stringsXml

          // console.log({ stringXmlPretty })

          fs.writeFileSync(stringsXmlPath, stringXmlPretty)
          console.log(
            `${language}: ${stringsXmlPath.replace(path.resolve('.'), '')}`,
          )
        }
      } else {
        let language2key2value = translatables.reduce(
          (language2key2value, translatable) => {
            if (!language2key2value[translatable.language]) {
              language2key2value[translatable.language] = {
                locale: translatable.language,
              }
            }
            language2key2value[translatable.language][translatable.key] =
              translatable.value
            return language2key2value
          },
          {},
        )
        
        let { locales, paths } = project

        if (!paths) {
          paths = ['translations/%lang%.json']
        }

        paths.forEach(path_ => {

          if (path_.includes('%lang%')) {
            locales.forEach(language => {

              let phrasesJsonPath = path.resolve(path_.replace('%lang%', language))
              let key2value = sortObject(language2key2value[language])
              
              fs.mkdirSync(path.dirname(phrasesJsonPath), { recursive: true });
              fs.writeFileSync(
                phrasesJsonPath,
                JSON.stringify(key2value, null, 2) + '\n',
              )
              console.log(
                `${language}: ${phrasesJsonPath.replace(path.resolve('.'), '')}`,
              )

            })
          } else {
            console.log(`Path ${path_} does not include %lang%`)
          }

        })

        
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
      }
    } catch (error) {
      console.log('error', error)
    }
  })

  return command
}

module.exports = downloadCommand
