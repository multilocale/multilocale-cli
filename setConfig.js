/* Copyright 2013 - 2022 Waiterio LLC */
const fs = require('fs-extra')
const path = require('path')

module.exports = function setConfig(config) {
  let configPath = path.resolve('.', 'multilocale.json')

  let string = ''

  if (config) {
    string = JSON.stringify(config)
  }

  config = fs.writeFileSync(configPath, string)

  return config
}
