/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import commander from 'commander'
import inquirer from 'inquirer'
import { toJson } from 'xml2json'
import getProjects from '@multilocale/multilocale-js-client/getProjects.js'
import rehydrateSession from './session/rehydrateSession.js'
import isLoggedInSession from './session/isLoggedInSession.js'
import getAndroidManifest from './getAndroidManifest.js'
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
      let androidManifestPath = await getAndroidManifest()
      console.log({ androidManifestPath })
      let stringsXmlPath = path.resolve(
        androidManifestPath.replace(
          'AndroidManifest.xml',
          'res/values/strings.xml',
        ),
      )

      if (stringsXmlPath.startsWith('/')) {
        stringsXmlPath = stringsXmlPath.slice(1)
      }

      let stringsXml = await promisify(fs.readFile)(stringsXmlPath, 'utf8')

      console.log({ stringsXml })

      let stringsJson = JSON.parse(toJson(stringsXml))

      console.log(stringsJson)
      let locale = 'en'

      let translatablesImported = stringsJson.resources.string.map(
        ({ name, $t }) => ({
          key: name,
          value: $t,
          locale,
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
          let answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'projectId',
              message: 'Which projects?',
              choices: projects.map(project => ({
                name: project.name,
                value: project._id,
              })),
            },
          ])

          console.log(answers)
        }
      }
    }
  })

  return command
}

export default importCommand
