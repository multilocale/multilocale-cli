/* Copyright 2013 - 2022 Waiterio LLC */
import path from 'path'
import getAndroidManifest from './getAndroidManifest.js'

export default function getAndroidResPath() {
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
