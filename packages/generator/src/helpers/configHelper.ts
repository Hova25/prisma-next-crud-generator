import { Config, CrudAction } from '../utils/configReader'

export const isIgnored = ({modelNameCamelCase, crudAction, config}: {modelNameCamelCase: string, crudAction: CrudAction, config: Config}) => {
  return config?.entity?.ignore?.[modelNameCamelCase]?.includes(crudAction)
}