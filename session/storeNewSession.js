/* Copyright 2013 - 2022 Waiterio LLC */
const {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} = require('@multilocale/multilocale-js-client/accessToken.js')
const { setRefreshTokenForMultilocaleClient } = require('@multilocale/multilocale-js-client/refreshToken.js')
const setAccessToken = require('./setAccessToken.js')
const setRefreshToken = require('./setRefreshToken.js')

module.exports = async function storeNewSession({ accessToken, refreshToken }) {
  try {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

    setAccessTokenForMultilocaleClient(accessToken, setAccessToken)
    setRefreshTokenForMultilocaleClient(refreshToken, setRefreshToken)
    setAccessTokenCallbackForMultilocaleClient(setAccessToken)

    return true
  } catch (error) {
    console.error('error', error)
    throw error
  }
}
