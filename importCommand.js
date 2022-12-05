/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import commander from 'commander'
import inquirer from 'inquirer'
import { toJson } from 'xml2json'
import addTranslatables from '@multilocale/multilocale-js-client/addTranslatables.js'
import getProject from '@multilocale/multilocale-js-client/getProject.js'
import getProjects from '@multilocale/multilocale-js-client/getProjects.js'
import uuid from '@multilocale/multilocale-js-client/uuid.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getAndroidResPath from './getAndroidResPath.js'
import getMultilocaleJson from './getMultilocaleJson.js'
import isAndroid from './isAndroid.js'
import login from './login.js'

function importCommand() {
  const command = new commander.Command('import')
  command.action(async () => {
    console.log('import into multilocale.com')

    rehydrateSession()

    if (!isLoggedInSession()) {
      await login()
    }

    if (await isAndroid()) {
      console.log('Android project detected')

      let androidResPath = await getAndroidResPath()
      let stringsXmlPath = path.resolve(androidResPath, 'values/strings.xml')
      let stringsXml = await promisify(fs.readFile)(stringsXmlPath, 'utf8')

      console.log({ stringsXml })

      let stringsJson = JSON.parse(toJson(stringsXml))

      console.log(stringsJson)
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

      let projectId

      let multilocaleJson = await getMultilocaleJson() // let multilocaleJson = await getMultilocaleJson()
      console.log({ multilocaleJson })

      projectId = multilocaleJson?.projectId

      if (!projectId) {
        let projects = await getProjects()

        if (projects.length === 0) {
          throw new Error(
            'There are no projects. Create one first at https://app.multilocale.com/projects/new',
          )
        } else if (projects.length === 1) {
          projectId = projects[0]._id
        } else {
          let choices = projects
            .map(project => ({
              name: project.name,
              value: project._id,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

          let answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'projectId',
              message: 'Which projects?',
              choices,
            },
          ])

          projectId = answers.projectId
        }
      }

      let project = await getProject(projectId)

      translatablesImported = translatablesImported.map(translatable => ({
        ...translatable,
        organizationId: project.organizationId,
        projects: [project.name],
      }))

      console.log({ translatablesImported })

      await addTranslatables(translatablesImported)

      console.log(
        `Added ${translatablesImported.length} translatables: https://app.multilocale.com/projects/${projectId}`,
      )
    }
  })

  return command
}

export default importCommand
