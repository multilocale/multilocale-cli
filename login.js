/* Copyright 2013 - 2022 Waiterio LLC */
const inquirer = require('inquirer')
const postLogin = require('@multilocale/multilocale-js-client/login.js')
const storeNewSession = require('./session/storeNewSession.js')

module.exports = async function login(email, password) {
  const answers = await inquirer.prompt([
    {
      name: 'email',
      when: !email,
    },
    {
      type: 'password',
      name: 'password',
      when: !password,
    },
  ])

  email = email || answers.email
  password = password || answers.password

  const { accessToken, refreshToken } = await postLogin(email, password).catch(
    console.error,
  )
  storeNewSession({ accessToken, refreshToken })
}
