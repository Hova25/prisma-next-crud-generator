import path from 'path'
import { writeFileSafely } from '../utils/writeFileSafely'
import { compileFile } from '../utils/compileFile'
import { logger } from '@prisma/internals'
import { DMMF } from '@prisma/generator-helper'
import { Config } from '../utils/configReader'

export type Paths = {
  generatorDirectory: string,
  outputRootDirectory: string,
  tscBinPath: string,
  appPath: string,
}

export type CallBackObject = {
  model?: DMMF.Model
  models?: DMMF.Model[]
  config?: Config
}

type GenPersonalizedFile = {
  templatePath?: string
  paths: Paths,
  defaultFileUrl?: string
  specificOutputFileName?: string
  outputFormat?: 'ts' | 'tsx'
  callBackObject?: CallBackObject
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
 * @param callBackObject
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
  callBackObject
}: GenPersonalizedFile) => {
  try {
    let fileUrl = defaultFileUrl
    let fileName = fileUrl.split("/").at(-1)!
    
    if(!defaultFileUrl && !templatePath) {
      return;
    }
    
    if(templatePath) {
      fileName = templatePath.split("/").at(-1)!
      const generatorDirectoryChild = path.join(generatorDirectory, templatePath.replace(`/${fileName}`, ''))
      const countDepth = (generatorDirectoryChild.replace(generatorDirectory, '').match(/\//g) || []).length + 1;
      
      await writeFileSafely(
        path.join(generatorDirectoryChild, fileName),
        undefined,
        undefined,
        path.join(outputRootDirectory, templatePath),
        {
          "from 'prisma-next-crud-generator'": `from '${"../".repeat(countDepth)}src'`
        }
      )
      
      await compileFile(generatorDirectoryChild, fileName, tscBinPath)
      fileUrl = path.resolve(generatorDirectoryChild, fileName.replace(".ts", ".js"))
    }
    
    const importedTemplate = await import(fileUrl);
    const file = fileName.split(".")[0];
    
    let content = importedTemplate[file]
    
    if(typeof content === 'function') {
      content = content(callBackObject)
    }
    
    await writeFileSafely(
      path.join(
        appPath,
        `${(specificOutputFileName || file)}.${outputFormat}`
      ),
      content
    );
    return true;
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.info(`Error to write ${specificOutputFileName} ${templatePath}`, e.message);
    } else {
      logger.info(`An unknown error occurred on write ${templatePath}`);
    }
  }
}