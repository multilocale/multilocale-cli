#!/usr/bin/env node
/* Copyright 2013 - 2022 Waiterio LLC */
import program from 'commander'
import downloadCommand from './downloadCommand.js'
import importCommand from './importCommand.js'
import loginCommand from './loginCommand.js'
import logoutCommand from './logoutCommand.js'

program
  .description('manage translatables')
  .version('0.0.1')
  .addCommand(downloadCommand())
  .addCommand(importCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand())
  .parse(process.argv)
