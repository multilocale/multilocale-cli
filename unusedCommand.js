/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const path = require('path')
const commander = require('commander')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const isAndroid = require('./isAndroid.js')
const isJavascript = require('./isJavascript.js')
const getFiles = require('./getFiles.js')
const getProject = require('./getProject.js')
const login = require('./login.js')

function unusedCommand() {
  const command = new commander.Command('unused')
  command.option('--project [project]', 'project id or name')
  command.action(async options => {
    try {
      console.log('find unused strings in project')

      rehydrateSession()


      if (!isLoggedInSession()) {
        await login()
      }

      let project = await getProject(options?.project)
      let defaultLocale = project.defaultLocale || 'en'
      
      if (isAndroid()) {
        console.log('Android project detected')

        throw new Error('Not implemented yet')

      } else if (isJavascript()) {
        console.log('Javascript project detected')

        let files = getFiles()
        const { locales, paths } = project
        console.log({ locales, paths })

        const locale2files = {}
        paths.forEach(path_ => {
          if (path_.includes('%lang%')) {
            locales.forEach(locale => {
              const suffix = path_.replace('%lang%', locale)
              const matchingFiles = files.filter(file => file.endsWith(suffix))

              if (matchingFiles.length === 0) {
                console.log(
                  `No matching files for path ${path_} and locale ${locale}`,
                )
              } else {
                if (!locale2files[locale]) {
                  locale2files[locale] = []
                }

                if (matchingFiles.length === 1) {
                  locale2files[locale].push(matchingFiles[0])
                } else if (matchingFiles.length > 1) {
                  console.log(
                    `Found multiple matching files for path ${path_} and locale ${locale}:`,
                  )
                  matchingFiles.forEach(matchingFile => {
                    console.log(`  ${matchingFile}`)
                    locale2files[locale].push(matchingFile)
                  })
                }
              }
            })
          } else {
            console.log(`Path ${path_} does not include %lang%`)
          }
        })

        const localesFound = Object.keys(locale2files)
        const filesFound = Object.values(locale2files).flat()

        const keysObject = {}

        if (filesFound.length > 0) {
          console.log(
            `Found ${filesFound.length} files in ${localesFound.length} locales:`,
          )
          filesFound.forEach(fileFound => console.log(`  ${fileFound}`))

          for (let l = 0; l < localesFound.length; l += 1) {
            let locale = localesFound[l]
            let files = locale2files[locale]

            for (let f = 0; f < files.length; f += 1) {
              let file = files[f]

              if (file.startsWith('/')) {
                file = file.substring(1)
              }

              let filePath = path.resolve(file)

              let fileString = fs.readFileSync(filePath, 'utf8')

              // console.log({ fileString })

              let extension = path.extname(file)
              // console.log({ extension })

              let json

              if (extension === '.json') {
                json = JSON.parse(fileString)
              } else if (!extension === '.json') {
                throw new Error(
                  `It was not possible to detect the extension of ${file}`,
                )
              } else {
                throw new Error(
                  `Unsupported file extension ${extension} for file ${file}`,
                )
              }

              let keys = Object.keys(json)

              const language = locale
              
              keys.forEach(key => {
                keysObject[key] = true
              })

              console.log(
                `${language}: Found ${keys.length} keys`,
              )
            }
          }

          let keys = Object.keys(keysObject)

          console.log(`Found ${keys.length} unique keys across all ${localesFound.length} locales`)

          const extensions = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs']
          files = files.filter(file => extensions.includes(path.extname(file)))
          // files = files.slice(0, 10);

          for (let f = 0; f < files.length; f += 1) {
            let file = files[f]

            let filePath = path.join(path.resolve('.'), file)
            
            let fileContent = fs.readFileSync(filePath, 'utf8')
            
            for (let k = 0; k < keys.length; k += 1) {
              let key = keys[k]

              if (fileContent.includes(key)) {
                delete keysObject[key]
              }
            }
          }

          let unusedKeys = Object.keys(keysObject)
          console.log(`${unusedKeys.length} keys could not be found in any file with extensions ${extensions.join(', ')}:`)
          console.log(unusedKeys)
          
        } else {
          console.log('Could not find any file matching paths in project')
        }

        let translatables = []
      } else {
        console.log('Could not detect project type')
      }
    } catch (error) {
      console.log(error)
    }
  })

  return command
}

module.exports = unusedCommand
