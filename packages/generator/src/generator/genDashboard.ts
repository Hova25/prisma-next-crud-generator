import { genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'
import { Config } from '../utils/configReader'

export const genDashboard = async(config: Config, paths: Paths) => {
  const {
    global: {
      dashboard: {
        path: dashboardPath = "",
        page: {
          disable: dashboardPageDisable = false,
          templatePath: dashboardPagePath = ""
        } = {},
        layout: {
          disable: dashboardLayoutDisable = false,
          templatePath: dashboardLayoutPath = ""
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
      paths
    })
  }
}