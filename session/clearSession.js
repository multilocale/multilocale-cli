/* Copyright 2013 - 2022 Waiterio LLC */

const {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} = require('@multilocale/multilocale-js-client/accessToken.js')
const {
  setRefreshTokenForMultilocaleClient,
} = require('@multilocale/multilocale-js-client/refreshToken.js')
const localStorage = require('./localStorage.js')

module.exports = function clearSession() {
  localStorage.clear()

  setAccessTokenCallbackForMultilocaleClient(null)

  setAccessTokenForMultilocaleClient(null)
  setRefreshTokenForMultilocaleClient(null)
}
