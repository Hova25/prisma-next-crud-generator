import { readFileSync } from "node:fs";
import * as yaml from "yaml"
import { z, ZodError } from 'zod'
import path from 'path'
import process from 'process'
import { GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/internals'

export function readYaml<T> (src: string): T | undefined{
  try {
    const file = readFileSync(src, 'utf8');
    const config = yaml.parse(file);
    return config as T;
  } catch (e) {
    logger.info(`Error to find config file ${src}`)
  }
}

const ignoreCrudSchema = z.array(z.union([
  z.literal('create').optional(),
  z.literal('read').optional(),
  z.literal('update').optional(),
  z.literal('delete').optional()
])).nullable();

const configSchema = z.object({
  ignore: z.record(ignoreCrudSchema).optional(),
}).strict();

type Config = z.infer<typeof configSchema>;

export const getConfig = (options: GeneratorOptions): Config | undefined =>  {
  const {generator: {config: {config: configFile = "./config/next_crud_generator"}}} = options
  let config = readYaml(path.join(process.cwd(), "prisma", `${configFile.toString()}.yaml`))
  if(!config) {
    config = readYaml<Config>(path.join(process.cwd(), "prisma", `${configFile.toString()}.yml`))
  }
  
  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.info(`Error to parse config file `, error.message)
    } else {
      console.error('Unexpected error in parse config file:');
    }
  }
}