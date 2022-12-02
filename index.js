#!/usr/bin/env node
/* Copyright 2013 - 2022 Waiterio LLC */
import program from 'commander'
import makeDownloadCommand from './makeDownloadCommand.js'

program
  .description('manage translatables')
  .version('0.0.0')
  .addCommand(makeDownloadCommand())
  .parse(process.argv)
