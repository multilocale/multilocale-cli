/* Copyright 2013 - 2022 Waiterio LLC */
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

async function getFiles_(dir) {
  const readdir = promisify(fs.readdir)
  const stat = promisify(fs.stat)
  const subdirs = await readdir(dir)
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const resource = path.resolve(dir, subdir)
      return (await stat(resource)).isDirectory()
        ? getFiles(resource)
        : resource
    }),
  )
  return files.reduce((a, f) => a.concat(f), [])
}

export default async function getFiles(dir) {
  dir = dir || '.'
  let files = await getFiles_(dir)

  files = files
    .map(file => file.replace(path.resolve('.'), ''))
    .filter(file => !file.startsWith('/.'))

  return files
}
