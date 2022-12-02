/* Copyright 2013 - 2022 Waiterio LLC */
import os from 'os'
import path from 'path'
import { LocalStorage } from 'node-localstorage'

let localStorage

if (!localStorage) {
  const homeDir = os.homedir()
  localStorage = new LocalStorage(path.resolve(homeDir, '.multilocale'))
}

export default localStorage
