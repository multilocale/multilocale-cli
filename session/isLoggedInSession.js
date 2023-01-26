/* Copyright 2013 - 2022 Waiterio LLC */
const { isRefreshTokenExpired } = require('@multilocale/multilocale-js-client/refreshToken.js')
const clearSession = require('./clearSession.js')

module.exports = function isLoggedInSession() {
  let isLoggedIn = false

  if (!isRefreshTokenExpired()) {
    isLoggedIn = true
  }

  if (!isLoggedIn) {
    clearSession()
  }

  return isLoggedIn
}
