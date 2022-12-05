/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs-extra'
import path from 'path'
import commander from 'commander'
import { toJson } from 'xml2json'
import addTranslatables from '@multilocale/multilocale-js-client/addTranslatables.js'
import uuid from '@multilocale/multilocale-js-client/uuid.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getAndroidResPath from './getAndroidResPath.js'
import isAndroid from './isAndroid.js'
import getProject from './getProject.js'
import login from './login.js'

function importCommand() {
  const command = new commander.Command('import')
  command.option('--project [project]', 'project id or name')
  command.action(async options => {
    console.log('import into multilocale.com')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    if (isAndroid()) {
      console.log('Android project detected')

      let androidResPath = getAndroidResPath()
      let stringsXmlPath = path.resolve(androidResPath, 'values/strings.xml')
      let stringsXml = fs.readFileSync(stringsXmlPath, 'utf8')

      // console.log({ stringsXml })

      let stringsJson = JSON.parse(toJson(stringsXml))

      // console.log(stringsJson)
      let language = 'en'

      let translatablesImported = stringsJson.resources.string.map(
        ({ name, $t }) => ({
          _id: uuid(),
          key: name,
          value: $t,
          language,
          creationTime: new Date().toISOString(),
          lastEditTime: new Date().toISOString(),
          googleTranslate: false,
          imported: true,
        }),
      )

      console.log(`Found ${translatablesImported.length} translatables`)

      let project = await getProject(options?.project)

      translatablesImported = translatablesImported.map(translatable => ({
        ...translatable,
        organizationId: project.organizationId,
        projects: [project.name],
      }))

      console.log({ translatablesImported })

      await addTranslatables(translatablesImported)

      console.log(
        `Added ${translatablesImported.length} translatables: https://app.multilocale.com/projects/${project._id}`,
      )
    }
  })

  return command
}

export default importCommand
