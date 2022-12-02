/* Copyright 2013 - 2022 Waiterio LLC */
import getAndroidManifest from './getAndroidManifest.js'

export default async function isAndroid() {
  return !!(await getAndroidManifest())
}
