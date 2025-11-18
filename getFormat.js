/* Copyright 2013 - 2022 Waiterio LLC */
const getConfig = require('./getConfig.js')

const formats = [
  'cjs',
  'esm',
  'json',
  'js',
  // 'xml',
]

module.exports = async function getFormat(options) {
  let format = options?.format
  const config = getConfig()

  if (!format) {
    format = config?.format
  }

  if (!formats.includes(format)) {
    throw new Error(`Invalid format: ${format}`)
  }

  if (!format) {
    format = 'json'
  }

  return format
}
