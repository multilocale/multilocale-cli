/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs-extra'
import getConfigPath from './getConfigPath.js'

export default function getConfig() {
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
