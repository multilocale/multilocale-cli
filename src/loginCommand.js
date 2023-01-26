/* Copyright 2013 - 2022 Waiterio LLC */
import commander from 'commander'
import login from './login.js'

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

export default loginCommand
