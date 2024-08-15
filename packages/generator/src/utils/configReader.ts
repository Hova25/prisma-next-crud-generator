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
  z.literal('readList').optional(),
  z.literal('readOne').optional(),
  z.literal('update').optional(),
  z.literal('delete').optional()
]));

type IgnoreCrudType = z.infer<typeof ignoreCrudSchema>;
export type CrudAction = NonNullable<IgnoreCrudType>[number];


const fileSchema = z.object({
  templatePath: z.string().optional(),
}).optional()

const genericFileSchema = z.intersection(
  z.object({
    disable: z.boolean().optional(),
  }),
  fileSchema
).optional()


const entitySchema = z.object({
  disable: z.boolean().optional(),
  // path: z.string().optional(), // example "/" or "/admin"
  ignore: ignoreCrudSchema.optional(),
}).strict()
// const entitySchema = z.intersection(
//   genericFileSchema,
//   z.object({
//     path: z.string().optional(), // example "/" or "/admin"
//     ignore: ignoreCrudSchema.optional(),
//   })
// )

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

const componentsCrudSchema = z.object({
  readList: fileSchema.optional(),
  readOne: fileSchema.optional(),
  delete: fileSchema.optional(),
  create: fileSchema.optional(),
  update: fileSchema.optional(),
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
  entity: z.record(z.string(), entitySchema).optional(),
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