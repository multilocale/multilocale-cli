/* Copyright 2013 - 2022 Waiterio LLC */
import commander from 'commander'
import addTranslatables from '@multilocale/multilocale-js-client/addTranslatables.js'
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
    value = value || key

    console.log('add string')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    let project = await getProject(options?.project)
    let language = project.defaultLocale || 'en'

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
    }

    // console.log({ translatable })

    await addTranslatables([translatable])

    console.log(
      `Added translatable: https://app.multilocale.com/projects/${project._id}`,
    )
  })

  return command
}

export default importCommand
