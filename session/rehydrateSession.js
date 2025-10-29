/* Copyright 2013 - 2022 Waiterio LLC */
const {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} = require('@multilocale/multilocale-js-client/accessToken.js')
const {
  setRefreshTokenForMultilocaleClient,
} = require('@multilocale/multilocale-js-client/refreshToken.js')
const getAccessToken = require('./getAccessToken.js')
const getRefreshToken = require('./getRefreshToken.js')
const setAccessToken = require('./setAccessToken.js')

module.exports = async function rehydrateSession() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  setAccessTokenForMultilocaleClient(accessToken)
  setRefreshTokenForMultilocaleClient(refreshToken)
  setAccessTokenCallbackForMultilocaleClient(setAccessToken)
}
