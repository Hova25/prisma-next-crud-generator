import { Config, CrudAction } from '../utils/configReader'

export const isIgnored = (
  {modelNameCamelCase, crudAction, config}:
    {modelNameCamelCase: string, crudAction: CrudAction, config?: Config}
) => {
  // console.log(config.entity?.[modelNameCamelCase], config?.entity?.[modelNameCamelCase]?.ignore)
  return config?.entity?.[modelNameCamelCase]?.ignore?.includes(crudAction)
}