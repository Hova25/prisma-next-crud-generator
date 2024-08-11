import { genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'
import { Config } from '../utils/configReader'

export const genDashboard = async(config: Config, paths: Paths) => {
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
      paths
    })
  }
  
  if(!dashboardLayoutDisable) {
    await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, '../template/layout'),
      templatePath: dashboardLayoutPath,
      specificOutputFileName: 'layout',
      paths
    })
  }
  
  if(!dashboardTemplateDisable) {
    await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: dashboardTemplatePath,
      specificOutputFileName: 'template',
      paths
    })
  }
  
  if(!dashboardLoadingDisable) {
    await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: dashboardLoadingPath,
      specificOutputFileName: 'loading',
      paths
    })
  }
}