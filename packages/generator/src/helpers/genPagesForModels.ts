import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import { layout } from '../template/layout'
// import { dashboard } from '../template/dashboard'
import { list } from '../template/list'
import { show } from '../template/show'
import { create } from '../template/create'
import { edit } from '../template/edit'
import { lib } from '../template/lib'
import { writeFileSafely } from '../utils/writeFileSafely'
import { sidebar } from '../template/components/sidebar'
import { input } from '../template/components/ui/input'
import { heading } from '../template/components/ui/heading'
import { button } from '../template/components/ui/button'
import { breadcrumbs } from '../template/components/ui/breadcrumbs'
import { select } from '../template/components/ui/select'
import { actions } from '../template/actions'
import { pascalToCamelCase, pascalToSnakeCase, pluralize } from '../utils/strings'
import { Config } from '../utils/configReader'
import { isIgnored } from './configHelper'
import { genPersonalizedFile, Paths } from '../generator/genPersonalizedFile'
import { genDashboard } from '../generator/genDashboard'

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
    } = {}
  } = config || {};
  
  const rootDirectory = path.dirname(path.dirname(__dirname))
  // todo: change generator directory in node modules
  const generatorDirectory = path.join(rootDirectory, ".generator")
  const tscBinPath = path.resolve(path.dirname(outputRootDirectory), 'node_modules', '.bin', 'tsc')
  
  const appPath =  path.join(outputRootDirectory, 'app', dashboardPath || "")
  const componentsPath = path.join(outputRootDirectory, 'components')
  const actionsPath = path.join(outputRootDirectory, 'actions')
  
  const sidebarFile = sidebar(models.map((model) => model.name))
  
  const globalFilePromises: Promise<void>[] = [
    writeFileSafely(path.join(componentsPath, 'Sidebar.tsx'), sidebarFile),
    writeFileSafely(path.join(componentsPath, 'ui', 'Input.tsx'), input),
    writeFileSafely(path.join(componentsPath, 'ui', 'Heading.tsx'), heading),
    writeFileSafely(path.join(componentsPath, 'ui', 'Button.tsx'), button),
    writeFileSafely(
      path.join(componentsPath, 'ui', 'Breadcrumbs.tsx'),
      breadcrumbs,
    ),
    writeFileSafely(path.join(componentsPath, 'ui', 'Select.tsx'), select),
  ];
  
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
    })
  }
  
  await genDashboard(config, {
    generatorDirectory,
    outputRootDirectory,
    tscBinPath,
    appPath
  });
  
  await Promise.all(globalFilePromises)

  for (const model of models) {
    const modelNameCamelCase = pascalToCamelCase(model.name)
    const modelNameSnakeCase = pascalToSnakeCase(model.name)
    const modelNameSnakeCasePlural = pluralize(modelNameSnakeCase)
    
    const promises: Promise<void>[] = [];
    
    if(!config || !isIgnored({modelNameCamelCase, config, crudAction: "readList"})) {
      const indexFile = list(model)
      promises.push(writeFileSafely(
        path.join(appPath, `${modelNameSnakeCasePlural}`, 'page.tsx'),
        indexFile,
      ))
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
    
    if(!config || !isIgnored({modelNameCamelCase, config, crudAction: "delete"})) {
      const actionsFile = actions(model.name, model.fields, models)
      promises.push(writeFileSafely(
        path.join(actionsPath, `${modelNameSnakeCase}.ts`),
        actionsFile,
      ))
    }
    
    await Promise.all(promises)
  }
}
