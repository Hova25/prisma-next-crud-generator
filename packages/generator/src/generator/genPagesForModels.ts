import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import { list } from '../template/list'
import { show } from '../template/show'
import { create } from '../template/create'
import { edit } from '../template/edit'
import { lib } from '../template/lib'
import { writeFileSafely } from '../utils/writeFileSafely'
import { actions } from '../template/actions'
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
  const actionsPath = path.join(outputRootDirectory, 'actions')
  
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
    
    const promises: Promise<void>[] = [];
    
    const callBackObjectWithModel: CallBackObject = {...callBackObject, model}
    
    const generatedFiles: string[] = []
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "readList"})) {
      const listFiles = await genNextAppDirectoryFiles({
        defaultTemplatePage: 'template/list',
        genericTemplatePage: crud?.readList?.page?.templatePath,
        appDirectoryFileConfig: entity?.[modelNameCamelCase]?.components?.readList,
        callBackObject: callBackObjectWithModel,
        paths: getPaths(path.join(appPath, entity?.[modelNameCamelCase]?.components?.readList?.path || modelNameSnakeCasePlural))
      })
      
      if(listFiles.length > 0) {
        generatedFiles.push(`readList[${listFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "readOne"})) {
      const listFiles = await genNextAppDirectoryFiles({
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
      
      if(listFiles.length > 0) {
        generatedFiles.push(`readOne[${listFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "create"})) {
      const listFiles = await genNextAppDirectoryFiles({
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
      
      if(listFiles.length > 0) {
        generatedFiles.push(`create[${listFiles.toString()}]`)
      }
    }
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "update"})) {
      const listFiles = await genNextAppDirectoryFiles({
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
      
      if(listFiles.length > 0) {
        generatedFiles.push(`update[${listFiles.toString()}]`)
      }
    }
    
    const actionsFile = actions(model.name, model.fields as DMMF.Field[], models)
    promises.push(writeFileSafely(
      path.join(actionsPath, `${modelNameSnakeCase}.ts`),
      actionsFile,
    ))
    generatedFiles.push('actions');
    
    console.log(`✅ Entity ${model.name} files (${generatedFiles.toString()}) as been created`)
    
    await Promise.all(promises)
  }
}
