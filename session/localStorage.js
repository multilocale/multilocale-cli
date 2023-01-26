/* Copyright 2013 - 2022 Waiterio LLC */
const os = require('os')
const path = require('path')
const { LocalStorage } = require('node-localstorage')

let localStorage

if (!localStorage) {
  const homeDir = os.homedir()
  localStorage = new LocalStorage(path.resolve(homeDir, '.multilocale'))
}

module.exports = localStorage
