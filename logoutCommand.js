/* Copyright 2013 - 2022 Waiterio LLC */
const commander = require('commander')
const clearSession = require('./session/clearSession.js')

function logoutCommand() {
  const command = new commander.Command('logout')
  command.action(async () => {
    try {
      console.log('logout')

      clearSession()

      console.log('logged out')
    } catch (error) {
      console.log('error', error)
    }
  })

  return command
}

module.exports = logoutCommand
