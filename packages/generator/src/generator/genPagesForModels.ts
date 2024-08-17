import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import { pascalToCamelCase, pascalToSnakeCase, pluralize } from '../utils/strings'
import { Config } from '../utils/configReader'
import { isIgnored } from '../helpers/configHelper'
import { CallBackObject, genPersonalizedFile, Paths } from './genPersonalizedFile'
import { genDashboard } from './genDashboard'
import { genComponents } from './genComponents'
import { genNextAppDirectoryFiles } from './genNextAppDirectoryFiles'

export async function genPagesForModels(models: DMMF.Model[], outputRootDirectory: string, config?: Config) {
  const {
    global: {
      dashboard: {
        path: dashboardPath = "",
      } = {},
      prismaConfig: {
        disable: prismaConfigDisable = false,
        templatePath: prismaConfigTemplatePath = '',
        path: prismaConfigPath = ''
      } = {}
    } = {},
    components: {
      path: componentsSpecificPath = '',
      crud = {}
    } = {},
    entity
  } = config || {};
  
  const rootDirectory = path.dirname(path.dirname(__dirname))
  // todo: change generator directory in node modules
  const generatorDirectory = path.join(rootDirectory, ".generator")
  const tscBinPath = path.resolve(path.dirname(outputRootDirectory), 'node_modules', '.bin', 'tsc')
  
  const appPath =  path.join(outputRootDirectory, 'app', dashboardPath || "")
  
  const callBackObject: CallBackObject = {
    models,
    config
  }
  
  if(!prismaConfigDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/lib'),
      templatePath: prismaConfigTemplatePath,
      specificOutputFileName: "prisma",
      outputFormat: 'ts',
      paths: {
        generatorDirectory,
        outputRootDirectory,
        tscBinPath,
        appPath: path.join(outputRootDirectory, prismaConfigPath ||  'lib'),
      },
      callBackObject
    })
  }
  
  const componentsPath = path.join(outputRootDirectory, componentsSpecificPath || 'components')
  
  await genComponents({
    config,
    callBackObject,
    paths: {
      generatorDirectory,
      outputRootDirectory,
      tscBinPath,
      appPath: componentsPath
    }
  });
  
  await genDashboard({
    config,
    callBackObject,
    paths: {
      generatorDirectory,
      outputRootDirectory,
      tscBinPath,
      appPath,
    },
  });
  
  const getPaths = (appPath: Paths["appPath"]) => {
    return {
      generatorDirectory,
      outputRootDirectory,
      tscBinPath,
      appPath,
    }
  }

  for (const model of models) {
    const modelNameCamelCase = pascalToCamelCase(model.name)
    const modelNameSnakeCase = pascalToSnakeCase(model.name)
    const modelNameSnakeCasePlural = pluralize(modelNameSnakeCase)
    
    if(entity?.[modelNameCamelCase]?.disable) {
      console.log(`❗ ${model.name} generation has skipped`);
      continue;
    }
    
    const callBackObjectWithModel: CallBackObject = {...callBackObject, model}
    
    const generatedFiles: string[] = []
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "actions"})) {
      const actions = await genPersonalizedFile({
        defaultFileUrl: path.resolve(__dirname, '../template/actions'),
        templatePath:  entity?.[modelNameCamelCase]?.components?.actions?.templatePath || crud?.actions?.templatePath,
        specificOutputFileName: modelNameSnakeCase,
        outputFormat: 'ts',
        paths: {
          generatorDirectory,
          outputRootDirectory,
          tscBinPath,
          appPath: path.join(outputRootDirectory, entity?.[modelNameCamelCase]?.components?.actions?.path || crud?.actions?.path ||  'actions'),
        },
        callBackObject: callBackObjectWithModel
      })
      
      if(actions) {
        generatedFiles.push('actions')
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "readList"})) {
      const readListFiles = await genNextAppDirectoryFiles({
        defaultTemplatePage: 'template/list',
        genericTemplatePage: crud?.readList?.page?.templatePath,
        appDirectoryFileConfig: entity?.[modelNameCamelCase]?.components?.readList,
        callBackObject: callBackObjectWithModel,
        paths: getPaths(path.join(appPath, entity?.[modelNameCamelCase]?.components?.readList?.path || modelNameSnakeCasePlural))
      })
      
      if(readListFiles.length > 0) {
        generatedFiles.push(`readList[${readListFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "readOne"})) {
      const readOneFiles = await genNextAppDirectoryFiles({
        defaultTemplatePage: 'template/show',
        genericTemplatePage: crud?.readOne?.page?.templatePath,
        appDirectoryFileConfig: entity?.[modelNameCamelCase]?.components?.readOne,
        callBackObject: callBackObjectWithModel,
        paths: getPaths(path.join(
          appPath,
          entity?.[modelNameCamelCase]?.components?.readOne?.path ||
          `${modelNameSnakeCasePlural}/[id]`
        ))
      })
      
      if(readOneFiles.length > 0) {
        generatedFiles.push(`readOne[${readOneFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "create"})) {
      const createFiles = await genNextAppDirectoryFiles({
        defaultTemplatePage: 'template/create',
        genericTemplatePage: crud?.create?.page?.templatePath,
        appDirectoryFileConfig: entity?.[modelNameCamelCase]?.components?.create,
        callBackObject: callBackObjectWithModel,
        paths: getPaths(path.join(
          appPath,
          entity?.[modelNameCamelCase]?.components?.create?.path ||
          `${modelNameSnakeCasePlural}/create`
        ))
      })
      
      if(createFiles.length > 0) {
        generatedFiles.push(`create[${createFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "update"})) {
      const updateFiles = await genNextAppDirectoryFiles({
        defaultTemplatePage: 'template/edit',
        genericTemplatePage: crud?.update?.page?.templatePath,
        appDirectoryFileConfig: entity?.[modelNameCamelCase]?.components?.update,
        callBackObject: callBackObjectWithModel,
        paths: getPaths(path.join(
          appPath,
          entity?.[modelNameCamelCase]?.components?.update?.path ||
          `${modelNameSnakeCasePlural}/[id]/edit`
        ))
      })
      
      if(updateFiles.length > 0) {
        generatedFiles.push(`update[${updateFiles.toString()}]`)
      }
    }
    
    console.log(`✅ Entity ${model.name} files (${generatedFiles.toString()}) as been created`)
  }
}
