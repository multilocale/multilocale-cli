/* Copyright 2013 - 2022 Waiterio LLC */
const commander = require('commander')
const addPhrases = require('@multilocale/multilocale-js-client/addPhrases.js')
const translateString = require('@multilocale/multilocale-js-client/translateString.js')
const uuid = require('@multilocale/multilocale-js-client/uuid.js')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const getProject = require('./getProject.js')
const login = require('./login.js')

function addCommand() {
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

    const project = await getProject(options?.project)
    const language = project.defaultLocale || 'en'

    const phrases = []

    const phraseOriginal = {
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

    // console.log({ phraseOriginal })

    phrases.push(phraseOriginal)
    console.log(`${language}: ${value}`)

    for (let i = 0; i < project.locales.length; i += 1) {
      const locale = project.locales[i]
      if (locale !== language) {
        const string = phraseOriginal.value
        const to = locale
        const from = phraseOriginal.language
        const { translation } = await translateString({
          string,
          to,
          from,
        })
        const phrase = {
          ...phraseOriginal,
          _id: uuid(),
          language: locale,
          googleTranslate: true,
          value: translation,
        }

        phrases.push(phrase)
        console.log(`${locale}: ${translation}`)
      }
    }

    // console.log(JSON.stringify(phrases, null, 2))

    await addPhrases(phrases)

    console.log(
      `Added ${phrases.length} phrases: https://app.multilocale.com/projects/${project._id}`,
    )
  })

  return command
}

module.exports = addCommand
