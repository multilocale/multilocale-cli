/* Copyright 2013 - 2022 Waiterio LLC */
import commander from 'commander'
import addTranslatables from '@multilocale/multilocale-js-client/addTranslatables.js'
import translateString from '@multilocale/multilocale-js-client/translateString.js'
import uuid from '@multilocale/multilocale-js-client/uuid.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getProject from './getProject.js'
import login from './login.js'

function importCommand() {
  const command = new commander.Command('add')
  command.argument('<key>', 'key of string')
  command.argument(
    '[value]',
    'value of string. If not provided, will be equal to key.',
  )
  command.option('--project [project]', 'project id or name')
  command.action(async (key, value, options) => {
    console.log('add string')
    if (!value) {
      value = value || key
      console.log('value not provided, using key as value')
    }

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    let project = await getProject(options?.project)
    let language = project.defaultLocale || 'en'

    let translatables = []

    let translatableOriginal = {
      _id: uuid(),
      key,
      value,
      language,
      creationTime: new Date().toISOString(),
      lastEditTime: new Date().toISOString(),
      googleTranslate: false,
      organizationId: project.organizationId,
      projects: [project.name],
      projectsIds: [project._id],
    }

    // console.log({ translatableOriginal })

    translatables.push(translatableOriginal)
    console.log(`${language}: ${value}`)

    for (let i = 0; i < project.locales.length; i += 1) {
      let locale = project.locales[i]
      if (locale !== language) {
        let string = translatableOriginal.value
        let to = locale
        let from = translatableOriginal.language
        let { translation } = await translateString({
          string,
          to,
          from,
        })
        let translatable = {
          ...translatableOriginal,
          _id: uuid(),
          language: locale,
          googleTranslate: true,
          value: translation,
        }

        translatables.push(translatable)
        console.log(`${locale}: ${translation}`)
      }
    }

    // console.log(JSON.stringify(translatables, null, 2))

    await addTranslatables(translatables)

    console.log(
      `Added ${translatables.length} phrases: https://app.multilocale.com/projects/${project._id}`,
    )
  })

  return command
}

export default importCommand
