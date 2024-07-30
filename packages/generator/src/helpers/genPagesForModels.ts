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
import { logger } from '@prisma/internals'
import { compileFile } from '../utils/compileFile'

export async function genPagesForModels(models: DMMF.Model[], output: string, config?: Config) {
  const {
    global: {
      dashboard: {
        path: dashboardPath = "",
        page: {
          templatePath: dashboardPageTemplate = ""
        } = {}
      } = {}
    } = {}
  } = config || {};
  
  const appPath =  path.join(output, 'app', dashboardPath || "")
  const componentsPath = path.join(output, 'components')
  const actionsPath = path.join(output, 'actions')
  const sidebarFile = sidebar(models.map((model) => model.name))
  
  const globalFilePromises: Promise<void>[] = [
    writeFileSafely(path.join(output, 'lib', 'prisma.ts'), lib),
    writeFileSafely(path.join(appPath, 'layout.tsx'), layout),
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
  
  try {
    let dashboardFileUrl = path.resolve(__dirname, '../template/dashboard')
    if(dashboardPageTemplate) {
      const rootDirectory = path.dirname(path.dirname(__dirname))
      const generatorDirectory = path.join(rootDirectory, ".generator")
      console.log("----------------", )
      const newFileName = 'dashboard.ts'
      globalFilePromises.push(
        writeFileSafely(
          path.join(generatorDirectory, newFileName),
          undefined,
          undefined,
          path.join(output,dashboardPageTemplate)
        )
      )
      compileFile(generatorDirectory, newFileName, rootDirectory)
      dashboardFileUrl = path.resolve(generatorDirectory, newFileName)
    }
   
    const { dashboard } = await import(dashboardFileUrl);
    globalFilePromises.push(writeFileSafely(path.join(appPath, 'page.tsx'), dashboard))
    
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.info("Error to write dashboard", e.message);
    } else {
      logger.info("An unknown error occurred on write dashboard");
    }
  }
  
  console.log(path.join(output,dashboardPageTemplate), path.join(appPath, 'page.tsx'))
  
  
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
