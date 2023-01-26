/* Copyright 2013 - 2022 Waiterio LLC */
const path = require('path')
const getAndroidManifest = require('./getAndroidManifest.js')

module.exports = function getAndroidResPath() {
  let androidManifestPath = getAndroidManifest()
  // console.log({ androidManifestPath })
  let resPath = path.resolve(
    androidManifestPath.replace('AndroidManifest.xml', 'res'),
  )

  if (resPath.startsWith('/')) {
    resPath = resPath.slice(1)
  }

  return resPath
}
