/* Copyright 2013 - 2022 Waiterio LLC */
import inquirer from 'inquirer'
import getProjectHttp from '@multilocale/multilocale-js-client/getProject.js'
import getProjects from '@multilocale/multilocale-js-client/getProjects.js'
import getMultilocaleJson from './getMultilocaleJson.js'

export default async function getProject(projectIdOrName) {
  let project

  if (!projectIdOrName) {
    let multilocaleJson = getMultilocaleJson()
    projectIdOrName = multilocaleJson?.projectId
  }

  if (!projectIdOrName) {
    let projects = await getProjects()

    if (projects.length === 0) {
      throw new Error(
        'There are no projects. Create one first at https://app.multilocale.com/projects/new',
      )
    } else if (projects.length === 1) {
      projectIdOrName = projects[0]._id
      project = projects[0] // eslint-disable-line prefer-destructuring
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
          message: 'Which project?',
          choices,
        },
      ])

      projectIdOrName = answers.projectId
      project = projects.find(project => project._id === projectIdOrName)
    }
  }

  if (!project && projectIdOrName) {
    project = await getProjectHttp(projectIdOrName)
  }

  return project
}
