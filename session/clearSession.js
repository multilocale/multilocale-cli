/* Copyright 2013 - 2022 Waiterio LLC */

import {
  setAccessTokenForMultilocaleClient,
  setAccessTokenCallbackForMultilocaleClient,
} from '@multilocale/multilocale-js-client/accessToken.js'
import { setRefreshTokenForMultilocaleClient } from '@multilocale/multilocale-js-client/refreshToken.js'
import localStorage from './localStorage.js'

export default function clearSession() {
  localStorage.clear()

  setAccessTokenCallbackForMultilocaleClient(null)

  setAccessTokenForMultilocaleClient(null)
  setRefreshTokenForMultilocaleClient(null)
}
