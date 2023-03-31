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

    let project = await getProject(options?.project)
    let language = project.defaultLocale || 'en'

    let phrases = []

    let phraseOriginal = {
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
      let locale = project.locales[i]
      if (locale !== language) {
        let string = phraseOriginal.value
        let to = locale
        let from = phraseOriginal.language
        let { translation } = await translateString({
          string,
          to,
          from,
        })
        let phrase = {
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
