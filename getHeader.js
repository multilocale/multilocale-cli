/* Copyright 2013 - 2022 Waiterio LLC */
const getConfig = require('./getConfig.js')

module.exports = async function getHeader(options) {
  let header = options?.header
  const config = getConfig()

  if (!header) {
    header = config?.header
  }

  if (!header) {
    header = ''
  }

  return header
}
