import { readFileSync } from "node:fs";
import * as yaml from "yaml"
import { z, ZodError } from 'zod'
import path from 'path'
import process from 'process'
import { GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/internals'
import { pascalToCamelCase } from './strings'

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
  z.literal('readList').optional(),
  z.literal('readOne').optional(),
  z.literal('update').optional(),
  z.literal('delete').optional(),
  z.literal('actions').optional()
]));

type IgnoreCrudType = z.infer<typeof ignoreCrudSchema>;
export type CrudAction = NonNullable<IgnoreCrudType>[number];

const genericFileSchema = z.object({
  disable: z.boolean().optional(),
  templatePath: z.string().optional(),
})

const nextAppDirectoryFileSchema = z.object({
  path: z.string().optional(), // example "/" or "/admin"
  page: genericFileSchema.optional(),
  layout: genericFileSchema.optional(),
  template: genericFileSchema.optional(),
  loading: genericFileSchema.optional(),
  // notFound: genericFileSchema.optional(),
  // error: genericFileSchema.optional(),
  // globalError: genericFileSchema.optional(),
  // route: genericFileSchema.optional(), not root for the moment (because we need to create and spécific feature for this)
  // default: genericFileSchema.optional(), not root for the moment (because we need to create and spécific feature for this)
}).strict()

export type NextAppDirectoryFileSchema = z.infer<typeof nextAppDirectoryFileSchema>;

const componentsCrudSchema = z.object({
  readList: nextAppDirectoryFileSchema.optional(),
  readOne: nextAppDirectoryFileSchema.optional(),
  delete: nextAppDirectoryFileSchema.optional(),
  create: nextAppDirectoryFileSchema.optional(),
  update: nextAppDirectoryFileSchema.optional(),
  actions: z.object({
    path: z.string().optional(),
    templatePath: z.string().optional()
  }).optional(),
}).strict()

const entitySchema = z.object({
  disable: z.boolean().optional(),
  // path: z.string().optional(), // example "/" or "/admin"
  ignore: ignoreCrudSchema.optional(),
  components: componentsCrudSchema.optional()
}).strict()

const globalSchema = z.object({
  dashboard: nextAppDirectoryFileSchema.optional(),
  prismaConfig: genericFileSchema.optional().and(
    z.object({ path: z.string().optional()})
  )
})

const componentsUiSchema = z.object({
  breadcrumbs: genericFileSchema.optional(),
  heading: genericFileSchema.optional(),
  button: genericFileSchema.optional(),
  input: genericFileSchema.optional(),
  select: genericFileSchema.optional(),
}).strict()


const componentsSchema = z.object({
  path: z.string().optional(),
  sidebar: genericFileSchema.optional(),
  ui: componentsUiSchema.optional(),
  crud: componentsCrudSchema.optional()
}).strict()

const configSchema = z.object({
  global: globalSchema.optional(),
  components: componentsSchema.optional(),
  entity: z.record(z.string(), entitySchema),
}).optional();

export type Config = z.infer<typeof configSchema>;

export const getConfig = (options: GeneratorOptions): Config | undefined =>  {
  const {generator: {config: {config: configFile = "./config/next_crud_generator"}}} = options
  let config = readYaml<Config>(path.join(process.cwd(), "prisma", `${configFile.toString()}.yaml`))
  if(!config) {
    config = readYaml<Config>(path.join(process.cwd(), "prisma", `${configFile.toString()}.yml`))
  }
  
  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.info(`Error to parse config file `, error.message)
    } else {
      logger.error(`Unexpected error in parse config file.`)
    }
    throw "Stop Process"
  }
}

export const getActionPath = (modelNameCamelCase: string = '', config?: Config) => {
  const { components, entity } = config || {};
  const globalCrudActionPath = components?.crud?.actions?.path
  const entityCrudActionPath = entity?.[modelNameCamelCase]?.components?.actions?.path
  return entityCrudActionPath || globalCrudActionPath || 'actions';
  
}