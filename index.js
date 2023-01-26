#!/usr/bin/env node
/* Copyright 2013 - 2022 Waiterio LLC */
const program = require('commander')
const addCommand = require('./addCommand.js')
const downloadCommand = require('./downloadCommand.js')
const importCommand = require('./importCommand.js')
const loginCommand = require('./loginCommand.js')
const logoutCommand = require('./logoutCommand.js')
const unusedCommand = require('./unusedCommand.js')
const packageJson = require('./package.json')

program
  .description('manage translatables')
  .version(packageJson.version)
  .addCommand(addCommand())
  .addCommand(downloadCommand())
  .addCommand(importCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand())
  .addCommand(unusedCommand())
  .parse(process.argv)
