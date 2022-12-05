/* Copyright 2013 - 2022 Waiterio LLC */
import commander from 'commander'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import { promisify } from 'util'
import { toXml } from 'xml2json'
import prettifyXml from 'xml-formatter'
import getTranslatables from '@multilocale/multilocale-js-client/getTranslatables.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getAndroidResPath from './getAndroidResPath.js'
import isAndroid from './isAndroid.js'
import login from './login.js'

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
  command.option('--project [project]', 'project name')
  command.action(async options => {
    console.log('download translations')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    let answers = await inquirer.prompt([
      {
        name: 'project',
        when: !options.project,
      },
    ])

    const { project } = {
      ...options,
      ...answers,
    }

    let translatables = await getTranslatables({ project }).catch(console.error)
    console.log(`Found ${translatables?.length ?? 0} translatables`)

    if (await isAndroid()) {
      console.log('Android project detected')
      let androidResPath = await getAndroidResPath()

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
        const stringsXml = toXml({
          resources: {
            string: keys.map(key => ({ name: key, $t: key2value[key] })),
          },
        })

        let folderPath =
          language === 'en'
            ? path.resolve(androidResPath, 'values')
            : path.resolve(androidResPath, `values-${language}`)

        if (!(await promisify(fs.exists)(folderPath))) {
          await promisify(fs.mkdir)(folderPath)
        }

        let stringsXmlPath = path.resolve(folderPath, 'strings.xml')

        let stringXmlPretty = prettifyXml(stringsXml)

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
      // console.log('language2key2value', language2key2value)
      let languages = Object.keys(language2key2value).sort()
      fs.mkdirsSync(path.resolve('./translations'))
      let indexJS = ''
      languages.forEach(language => {
        indexJS += `import ${language} from './${language}.json'\n`
      })
      indexJS += '\nexport default {\n'
      languages.forEach(language => {
        indexJS += `  ${language},\n`
      })
      indexJS += '}\n'
      fs.writeFileSync(path.resolve('./translations/index.js'), indexJS)
      let languagesJS = 'export default [\n'
      languages.forEach(language => {
        languagesJS += `  '${language}',\n`
      })
      languagesJS += ']\n'
      fs.writeFileSync(path.resolve('./translations/languages.js'), languagesJS)
      languages.forEach(language => {
        let key2value = sortObject(language2key2value[language])
        fs.writeFileSync(
          path.resolve(`./translations/${language}.json`),
          JSON.stringify(key2value, null, 2) + '\n',
        )
      })
    }
  })

  return command
}

export default downloadCommand
