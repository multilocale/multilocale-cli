/* Copyright 2013 - 2022 Waiterio LLC */
import localStorage from './localStorage.js'

export default function setRefreshToken(refreshToken) {
  return localStorage.setItem('refreshToken', refreshToken)
}
