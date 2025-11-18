/* Copyright 2013 - 2022 Waiterio LLC */
const getConfig = require('./getConfig.js')

module.exports = async function getPostScript(options) {
  let postScript = options?.postScript || options?.['post-script']
  const config = getConfig()

  if (!postScript) {
    postScript = config?.postScript || config?.['post-script']
  }

  if (!postScript) {
    postScript = ''
  }

  return postScript
}
