import fs from 'fs'
import path from 'path'
import { formatFile } from './formatFile'

export const writeFileSafely = async (
  writeLocation: string,
  content?: any,
  fileFormat?: string,
  copyFrom?: string
) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  })

  if(copyFrom ) {
    fs.copyFileSync(copyFrom, writeLocation)
  } else {
    fs.writeFileSync(writeLocation, await formatFile(content, fileFormat))
  }
}