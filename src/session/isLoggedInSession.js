/* Copyright 2013 - 2022 Waiterio LLC */
import { isRefreshTokenExpired } from '@multilocale/multilocale-js-client/refreshToken.js'
import clearSession from './clearSession.js'

export default function isLoggedInSession() {
  let isLoggedIn = false

  if (!isRefreshTokenExpired()) {
    isLoggedIn = true
  }

  if (!isLoggedIn) {
    clearSession()
  }

  return isLoggedIn
}
