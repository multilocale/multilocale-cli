/* Copyright 2013 - 2022 Waiterio LLC */
import {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} from '@multilocale/multilocale-js-client/accessToken.js'
import { setRefreshTokenForMultilocaleClient } from '@multilocale/multilocale-js-client/refreshToken.js'
import getAccessToken from './getAccessToken.js'
import getRefreshToken from './getRefreshToken.js'
import setAccessToken from './setAccessToken.js'

export default async function rehydrateSession() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  setAccessTokenForMultilocaleClient(accessToken)
  setRefreshTokenForMultilocaleClient(refreshToken)
  setAccessTokenCallbackForMultilocaleClient(setAccessToken)
}
