import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/internals'
import { GENERATOR_NAME } from './constants'
import { genPagesForModels } from './helpers/genPagesForModels'
import * as process from 'process'
import * as path from 'path'
import { getConfig } from './utils/configReader'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`)
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const { models } = options.dmmf.datamodel
    // console.log(models,  options.generator)
    
    const config = getConfig(options)
    
    // console.log(config)
    const outputFolder = options.generator.output?.value!

    await genPagesForModels(models, outputFolder)
  },
})
