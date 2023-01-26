/* Copyright 2013 - 2022 Waiterio LLC */
import getAndroidManifest from './getAndroidManifest.js'

export default function isAndroid() {
  return !!getAndroidManifest()
}
