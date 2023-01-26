/* Copyright 2013 - 2022 Waiterio LLC */
const commander = require('commander')
const login = require('./login.js')

function loginCommand() {
  const command = new commander.Command('login')
  command.option('--email [email]', 'email of user')
  command.option('--password [password]', 'password of user')
  command.action(async options => {
    try {
      console.log('login')

      await login(options?.email, options?.password)

      console.log('logged in')
    } catch (error) {
      console.log('error', error)
    }
  })

  return command
}

module.exports = loginCommand
