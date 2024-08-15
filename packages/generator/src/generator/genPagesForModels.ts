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
      crud
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
    
    const appPaths: Paths = {
      generatorDirectory,
      outputRootDirectory,
      tscBinPath,
      appPath: path.join(appPath, modelNameSnakeCasePlural),
    }
    
    const generatedFiles: string[] = []
    
    if(!isIgnored({modelNameCamelCase, config, crudAction: "readList"})) {
      const readListTemplatePath = crud?.readList?.templatePath || undefined
      const listGenerated = await genPersonalizedFile({
        defaultFileUrl: path.resolve(__dirname, '../template/list'),
        templatePath: readListTemplatePath,
        specificOutputFileName: "page",
        paths: appPaths,
        callBackObject: callBackObjectWithModel
      })
      if(listGenerated) {
        generatedFiles.push('readList')
      }
    }
    
    if(!config || !isIgnored({modelNameCamelCase, config, crudAction: "readOne"})) {
      const showFile = show(model.name, model.fields)
      promises.push(writeFileSafely(
        path.join(appPath, `${modelNameSnakeCasePlural}`, '[id]', 'page.tsx'),
        showFile,
      ))
    }
    
    if(!config || !isIgnored({modelNameCamelCase, config, crudAction: "create"})) {
      const createFile = create(model.name, model.fields)
      promises.push(writeFileSafely(
        path.join(appPath, `${modelNameSnakeCasePlural}`, 'create', 'page.tsx'),
        createFile,
      ))
    }
    if(!config || !isIgnored({modelNameCamelCase, config, crudAction: "update"})) {
      const editFile = edit(model.name, model.fields)
      promises.push(writeFileSafely(
        path.join(
          appPath,
          `${modelNameSnakeCasePlural}`,
          '[id]',
          'edit',
          'page.tsx',
        ),
        editFile,
      ))
    }
    
    const actionsFile = actions(model.name, model.fields, models)
    promises.push(writeFileSafely(
      path.join(actionsPath, `${modelNameSnakeCase}.ts`),
      actionsFile,
    ))
    generatedFiles.push('actions');
    
    console.log(`✅ Entity ${model.name} files (${generatedFiles.toString()}]) as been created`)
    
    await Promise.all(promises)
  }
}
