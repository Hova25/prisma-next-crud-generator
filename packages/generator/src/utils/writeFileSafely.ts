import fs from 'fs'
import path from 'path'
import { formatFile } from './formatFile'

export const writeFileSafely = async (
  writeLocation: string,
  content?: any,
  fileFormat?: string,
  copyFrom?: string,
  replaceMap: Record<string, string> = {
    "from 'prisma-next-crud-generator'": "from '../src'"
  }
) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  })
  
  let fileContent
  if(copyFrom ) {
    fileContent = fs.readFileSync(copyFrom, 'utf-8');
    if (replaceMap) {
      for (const [search, replacement] of Object.entries(replaceMap)) {
        fileContent = fileContent.replaceAll(search, replacement);
      }
    }
  } else {
    fileContent = await formatFile(content, fileFormat);
  }
  fs.writeFileSync(writeLocation, fileContent);
}