/* Copyright 2013 - 2022 Waiterio LLC */
import {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} from '@multilocale/multilocale-js-client/accessToken.js'
import { setRefreshTokenForMultilocaleClient } from '@multilocale/multilocale-js-client/refreshToken.js'
import setAccessToken from './setAccessToken.js'
import setRefreshToken from './setRefreshToken.js'

export default async function storeNewSession({ accessToken, refreshToken }) {
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
