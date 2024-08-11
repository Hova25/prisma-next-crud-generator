import path from 'path'
import { writeFileSafely } from '../utils/writeFileSafely'
import { compileFile } from '../utils/compileFile'
import { logger } from '@prisma/internals'
import { DMMF } from '@prisma/generator-helper'

export type Paths = {
  generatorDirectory: string,
  outputRootDirectory: string,
  tscBinPath: string,
  appPath: string,
}

type GenPersonalizedFile = {
  templatePath: string
  paths: Paths,
  defaultFileUrl?: string
  specificOutputFileName?: string
  outputFormat?: 'ts' | 'tsx'
  callBackObject?: {
    models?: DMMF.Model[]
  }
}

/**
 *
 * @param defaultFileUrl is where we can find the default file
 * @param templatePath is the personalised template path
 * @param generatorDirectory is where we compile the personalised file
 * @param outputRootDirectory is a root folder (example: src)
 * @param tscBinPath is where we can find the tsc binary to compile file
 * @param appPath is where we create the files
 * @param specificOutputFileName is if we want change fileName when we copy it
 * @param outputFormat TS or TSX default TSX
 */
export const genPersonalizedFile = async({
  defaultFileUrl = '',
  templatePath,
  specificOutputFileName,
  outputFormat = 'tsx',
  paths: {
   generatorDirectory,
   outputRootDirectory,
   tscBinPath,
   appPath
  },
  callBackObject: {
    models
  } = {}
}: GenPersonalizedFile) => {
  try {
    let fileUrl = defaultFileUrl
    let fileName = fileUrl.split("/").at(-1)!
    
    if(!defaultFileUrl && !templatePath) {
      return;
    }
    
    if(templatePath) {
      fileName = templatePath.split("/").at(-1)!
      
      await writeFileSafely(
        path.join(generatorDirectory, fileName),
        undefined,
        undefined,
        path.join(outputRootDirectory, templatePath)
      )
      
      compileFile(generatorDirectory, fileName, tscBinPath)
      fileUrl = path.resolve(generatorDirectory, fileName.replace(".ts", ".js"))
    }
    
    const importedTemplate = await import(fileUrl);
    const file = fileName.split(".")[0];
    
    let content = importedTemplate[file]
    
    if(typeof content === 'function') {
      content = content(models)
    }
    
    await writeFileSafely(
      path.join(
        appPath,
        `${(specificOutputFileName || file)}.${outputFormat}`
      ),
      content
    );
    
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.info(`Error to write ${specificOutputFileName} ${templatePath}`, e.message);
    } else {
      logger.info(`An unknown error occurred on write ${templatePath}`);
    }
  }
}