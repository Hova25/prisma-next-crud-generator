import { genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'
import { Config } from '../utils/configReader'
import { sidebar } from '../template/components/sidebar'
import { DMMF } from '@prisma/generator-helper'

export const genComponents = async(config: Config, paths: Paths, models: DMMF.Model[] = [],) => {
  const {
    components: {
      path: componentsPath = '',
      sidebar: {
        disable: sidebarDisable = false,
        templatePath: sidebarTemplatePath = ''
      } = {},
      ui: {
        breadcrumbs: {
          disable: breadcrumbsDisable = false,
          templatePath: breadcrumbsTemplatePath = ''
        } = {},
        heading: {
          disable: headingDisable = false,
          templatePath: headingTemplatePath = ''
        } = {},
        button: {
          disable: buttonDisable = false,
          templatePath: buttonTemplatePath = ''
        } = {},
        input: {
          disable: inputDisable = false,
          templatePath: inputTemplatePath = ''
        } = {},
        select: {
          disable: selectDisable = false,
          templatePath: selectTemplatePath = ''
        } = {}
      } = {}
    } = {}
  } = config || {};
  
  if(!sidebarDisable) {
    await genPersonalizedFile({
      defaultFile: sidebar(models.map((model) => model.name)),
      templatePath: sidebarTemplatePath,
      specificOutputFileName: "Sidebar",
      paths
    })
  }
  const uiPath = {
    ...paths,
    appPath: path.join(paths.appPath, 'ui')
  }
  
  if(!breadcrumbsDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/breadcrumbs'),
      templatePath: breadcrumbsTemplatePath,
      specificOutputFileName: "Breadcrumbs",
      paths: uiPath
    })
  }
  
  if(!headingDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/heading'),
      templatePath: headingTemplatePath,
      specificOutputFileName: "Heading",
      paths: uiPath
    })
  }
  
  if(!buttonDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/button'),
      templatePath: buttonTemplatePath,
      specificOutputFileName: "Button",
      paths: uiPath
    })
  }
  
  if(!inputDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/input'),
      templatePath: inputTemplatePath,
      specificOutputFileName: "Input",
      paths: uiPath
    })
  }
  
  if(!selectDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/select'),
      templatePath: selectTemplatePath,
      specificOutputFileName: "Select",
      paths: uiPath
    })
  }
}