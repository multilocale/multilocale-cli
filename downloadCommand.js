/* Copyright 2013 - 2022 Waiterio LLC */
import commander from 'commander'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import getTranslatables from '@multilocale/multilocale-js-client/getTranslatables.js'
import login from '@multilocale/multilocale-js-client/login.js'
import { setTokenForMultilocaleClient } from '@multilocale/multilocale-js-client/token.js'

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
  command.option('--email [email]', 'email of user')
  command.option('--password [password]', 'password of user')
  command.option('--project [project]', 'project name')
  command.action(async options => {
    console.log('download translations')

    let answers = await inquirer.prompt([
      {
        name: 'email',
        when: !options.email,
      },
      {
        type: 'password',
        name: 'password',
        when: !options.password,
      },
      {
        name: 'project',
        when: !options.project,
      },
    ])

    const { email, password, project } = {
      ...options,
      ...answers,
    }

    let { accessToken } = await login(email, password).catch(console.error)
    setTokenForMultilocaleClient(accessToken)

    let translatables = await getTranslatables({ project }).catch(console.error)
    console.log(`Found ${translatables?.length ?? 0} translatables`)

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
  })

  return command
}

export default downloadCommand
