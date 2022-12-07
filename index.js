#!/usr/bin/env node
/* Copyright 2013 - 2022 Waiterio LLC */
import program from 'commander'
import addCommand from './addCommand.js'
import downloadCommand from './downloadCommand.js'
import importCommand from './importCommand.js'
import loginCommand from './loginCommand.js'
import logoutCommand from './logoutCommand.js'
import packageJson from './package.json' assert { type: 'json' }

program
  .description('manage translatables')
  .version(packageJson.version)
  .addCommand(addCommand())
  .addCommand(downloadCommand())
  .addCommand(importCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand())
  .parse(process.argv)
