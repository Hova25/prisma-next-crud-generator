import path from 'path'
import { writeFileSafely } from '../utils/writeFileSafely'
import { compileFile } from '../utils/compileFile'
import { logger } from '@prisma/internals'

type GenPersonalizedFile = {
  templatePath: string
  generatorDirectory: string
  output: string
  tscBinPath: string
  appPath: string
  defaultFileUrl: string
  specificOutputFileName?: string
}

export const genPersonalizedFile = async({
  defaultFileUrl,
  templatePath,
  generatorDirectory,
  output,
  tscBinPath,
  appPath,
  specificOutputFileName
}: GenPersonalizedFile) => {
  try {
    let fileUrl = defaultFileUrl
    let fileName = fileUrl.split("/").at(-1)!
    if(templatePath) {
      fileName = templatePath.split("/").at(-1)!
      
      await writeFileSafely(
        path.join(generatorDirectory, fileName),
        undefined,
        undefined,
        path.join(output,templatePath)
      )
      
      compileFile(generatorDirectory, fileName, tscBinPath)
      fileUrl = path.resolve(generatorDirectory, fileName)
    }
    
    const importedTemplate = await import(fileUrl);
    const file = fileName.split(".")[0];
    await writeFileSafely(path.join(appPath, (specificOutputFileName || file) + ".tsx" ), importedTemplate[file]);
    // await writeFileSafely(path.join(appPath, (specificOutputFileName || file) + ".tsx" ), importedTemplate[file]);
    
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.info(`Error to write ${templatePath}`, e.message);
    } else {
      logger.info(`An unknown error occurred on write ${templatePath}`);
    }
  }
}