import { CallBackObject, genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'
import { Config } from '../utils/configReader'

type GenComponents = {
  config?: Config,
  paths: Paths,
  callBackObject: CallBackObject
}

export const genComponents = async({ config, paths, callBackObject }: GenComponents) => {
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
      defaultFileUrl: path.resolve(__dirname, '../template/components/sidebar'),
      templatePath: sidebarTemplatePath,
      specificOutputFileName: "Sidebar",
      paths,
      callBackObject
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
      paths: uiPath,
      callBackObject
    })
  }
  
  if(!headingDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/heading'),
      templatePath: headingTemplatePath,
      specificOutputFileName: "Heading",
      paths: uiPath,
      callBackObject
    })
  }
  
  if(!buttonDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/button'),
      templatePath: buttonTemplatePath,
      specificOutputFileName: "Button",
      paths: uiPath,
      callBackObject
    })
  }
  
  if(!inputDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/input'),
      templatePath: inputTemplatePath,
      specificOutputFileName: "Input",
      paths: uiPath,
      callBackObject
    })
  }
  
  if(!selectDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/components/ui/select'),
      templatePath: selectTemplatePath,
      specificOutputFileName: "Select",
      paths: uiPath,
      callBackObject
    })
  }
}