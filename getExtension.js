/* Copyright 2013 - 2022 Waiterio LLC */
const getConfig = require('./getConfig.js')
const getFormat = require('./getFormat.js')

module.exports = async function getExtension(options) {
  let extension = options?.extension
  let format = await getFormat(options)

  const config = getConfig()

  if (!extension) {
    extension = config?.extension
  }

  if (!extension) {
    switch (format) {
      case 'json':
        extension = 'json'
        break
      case 'cjs':
      case 'esm':
      case 'js':
        extension = 'js'
      case 'xml':
        extension = 'xml'
      default:
        extension = 'json'
        break
    }
  }

  return extension
}
