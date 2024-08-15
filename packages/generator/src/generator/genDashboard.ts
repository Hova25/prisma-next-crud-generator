import { CallBackObject, genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'
import { Config } from '../utils/configReader'

type GenDashboard = {
  config?: Config,
  paths: Paths,
  callBackObject: CallBackObject
}

export const genDashboard = async({ config, paths, callBackObject }: GenDashboard) => {
  const {
    global: {
      dashboard: {
        page: {
          disable: dashboardPageDisable = false,
          templatePath: dashboardPagePath = ""
        } = {},
        layout: {
          disable: dashboardLayoutDisable = false,
          templatePath: dashboardLayoutPath = ""
        } = {},
        template: {
          disable: dashboardTemplateDisable = false,
          templatePath: dashboardTemplatePath = ""
        } = {},
        loading: {
          disable: dashboardLoadingDisable = false,
          templatePath: dashboardLoadingPath = ""
        } = {}
      } = {},
    } = {}
  } = config || {};
  
  if(!dashboardPageDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/dashboard'),
      templatePath: dashboardPagePath,
      specificOutputFileName: "page",
      paths,
      callBackObject
    })
  }
  
  if(!dashboardLayoutDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/layout'),
      templatePath: dashboardLayoutPath,
      specificOutputFileName: 'layout',
      paths,
      callBackObject
    })
  }
  
  if(!dashboardTemplateDisable) {
    await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: dashboardTemplatePath,
      specificOutputFileName: 'template',
      paths,
      callBackObject
    })
  }
  
  if(!dashboardLoadingDisable) {
    await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: dashboardLoadingPath,
      specificOutputFileName: 'loading',
      paths,
      callBackObject
    })
  }
}