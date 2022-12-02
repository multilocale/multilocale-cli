/* Copyright 2013 - 2022 Waiterio LLC */
import inquirer from 'inquirer'
import postLogin from '@multilocale/multilocale-js-client/login.js'
import storeNewSession from './session/storeNewSession.js'

export default async function login() {
  let answers = await inquirer.prompt([
    {
      name: 'email',
    },
    {
      type: 'password',
      name: 'password',
    },
  ])

  const { email, password } = {
    ...answers,
  }

  let { accessToken, refreshToken } = await postLogin(email, password).catch(
    console.error,
  )
  storeNewSession({ accessToken, refreshToken })
}
