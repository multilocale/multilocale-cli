/* Copyright 2013 - 2022 Waiterio LLC */
const inquirer = require('inquirer')
const getProjectHttp = require('@multilocale/multilocale-js-client/getProject.js')
const getProjects = require('@multilocale/multilocale-js-client/getProjects.js')
const getConfig = require('./getConfig.js')
const setConfig = require('./setConfig.js')

module.exports = async function getProject(options) {
  let projectIdOrName = options?.project
  let project

  const config = getConfig()

  if (!projectIdOrName) {
    projectIdOrName = config?.projectId
  }

  if (!projectIdOrName) {
    const projects = await getProjects()

    if (projects.length === 0) {
      throw new Error(
        'There are no projects. Create one first at https://app.multilocale.com/projects/new',
      )
    } else if (projects.length === 1) {
      projectIdOrName = projects[0]._id
      project = projects[0] // eslint-disable-line prefer-destructuring
    } else {
      const choices = projects
        .map(project => ({
          name: project.name,
          value: project._id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      const answers = await inquirer.prompt([
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

    if (project && !config) {
      setConfig({
        organizationId: project.organizationId,
        projectId: project._id,
      })
      console.log('created multilocale.json with default projectId')
    }
  }

  if (!project && projectIdOrName) {
    project = await getProjectHttp(projectIdOrName)
  }

  return project
}
