/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const getConfigPath = require('./getConfigPath.js')

module.exports = function getConfig() {
  let config
  let configPath = getConfigPath()

  if (configPath) {
    config = fs.readFileSync(configPath, 'utf8')

    if (config) {
      config = JSON.parse(config)
    }
  }

  return config
}
