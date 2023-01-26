/* Copyright 2013 - 2022 Waiterio LLC */
const localStorage = require('./localStorage.js')

module.exports = function setRefreshToken(refreshToken) {
  return localStorage.setItem('refreshToken', refreshToken)
}
