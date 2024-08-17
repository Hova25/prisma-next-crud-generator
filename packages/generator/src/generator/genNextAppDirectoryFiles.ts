import { NextAppDirectoryFileSchema } from '../utils/configReader'
import { CallBackObject, genPersonalizedFile, Paths } from './genPersonalizedFile'
import path from 'path'

type GenNextAppDirectoryFiles = {
  appDirectoryFileConfig?: NextAppDirectoryFileSchema,
  paths: Paths,
  callBackObject: CallBackObject,
  defaultTemplatePage: string
  genericTemplatePage?: string
}

/**
 *
 * @param appDirectoryFileConfig
 * @param paths
 * @param callBackObject
 * @param defaultTemplatePage
 * @param genericTemplatePage is personalized global template
 */
export const genNextAppDirectoryFiles = async ({
  appDirectoryFileConfig,
  paths,
  callBackObject,
  defaultTemplatePage,
  genericTemplatePage
}: GenNextAppDirectoryFiles) => {
  const {
    page: {
      disable: pageDisable = false,
      templatePath: pagePath = ""
    } = {},
    layout: {
      disable: layoutDisable = false,
      templatePath: layoutPath = ""
    } = {},
    template: {
      disable: templateDisable = false,
      templatePath: templatePath = ""
    } = {},
    loading: {
      disable: loadingDisable = false,
      templatePath: loadingPath = ""
    } = {}
  } = appDirectoryFileConfig || {}
  
  const createdFiles: string[] = []
  
  if(!pageDisable) {
    const page = await genPersonalizedFile({
      defaultFileUrl: path.resolve(__dirname, `../${defaultTemplatePage}`),
      templatePath: pagePath || genericTemplatePage,
      specificOutputFileName: "page",
      paths,
      callBackObject
    })
    
    if(page) {
      createdFiles.push('page')
    }
  }
  
  if(!layoutDisable) {
    const layout = await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: layoutPath,
      specificOutputFileName: 'layout',
      paths,
      callBackObject
    })
    
    if(layout) {
      createdFiles.push('layout')
    }
  }
  
  if(!templateDisable) {
    const template = await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: templatePath,
      specificOutputFileName: 'template',
      paths,
      callBackObject
    })
    
    if(template) {
      createdFiles.push('template')
    }
  }
  
  if(!loadingDisable) {
    const loading = await genPersonalizedFile({
      defaultFileUrl: '',
      templatePath: loadingPath,
      specificOutputFileName: 'loading',
      paths,
      callBackObject
    })
    
    if(loading) {
      createdFiles.push('loading')
    }
  }
  
  return createdFiles;
}