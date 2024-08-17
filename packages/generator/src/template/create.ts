import { mapFieldsToFormInputs } from '../helpers/mapFieldsToFormInputs'
import {
  pascalCaseToSpaces,
  pascalToCamelCase,
  pascalToSnakeCase,
  pluralize,
  singularize,
} from '../utils/strings'
import { CallBackObject } from '../generator/genPersonalizedFile'
import { getActionPath } from '../utils/configReader'

export const create = ({ model, config }: CallBackObject) => {
  if(!model) {
    return;
  }
  const {name: modelName, fields} = model;
  
  const fieldsInput = mapFieldsToFormInputs(fields);

  const relations = fields
    .filter((field) => field.kind === 'object')
    .map((field) => ({ name: field.name, type: field.type }))

  const relationsQueries = generateRelationsQueries(relations);
  const hasRelations = relations.length > 0;
  
  const actionPath = getActionPath(pascalToCamelCase(modelName), config);
  
  return createPageTemplate(
    modelName,
    fieldsInput,
    relationsQueries,
    hasRelations,
    actionPath
  )
}

function generateRelationsQueries(relations: { name: string; type: string }[]) {
  return relations.reduce(
    (result, relation) =>
      result +
      `
    const ${pluralize(relation.name)} = await prisma.${singularize(
      pascalToCamelCase(relation.type),
    )}.findMany();
  `,
    '',
  )
}

function createPageTemplate(
  modelName: string,
  fieldsInput: string,
  relationsQueries: string,
  hasRelations: boolean,
  actionPath: string
) {
  const modelNameSpacedPlural = pluralize(pascalCaseToSpaces(modelName))
  const modelNameSnakeCase = pascalToSnakeCase(modelName)
  const modelNameSnakeCasePlural = pluralize(modelNameSnakeCase)

  return `
  import Link from 'next/link';
  import { create${modelName} } from '@/${actionPath}/${modelNameSnakeCase}';
  import { Input } from '@/components/ui/Input';
  import { Heading } from '@/components/ui/Heading';
  import { Button } from '@/components/ui/Button';
  ${hasRelations ? `import { Select } from '@/components/ui/Select';` : ''}
  
  export default async function ${modelName}CreatePage() {
    ${relationsQueries}
    return (
      <>
        <header className="mb-4">
          <Heading>Create ${modelName}</Heading>
        </header>
        <form action={create${modelName}} className="px-2 max-w-xl">
          ${fieldsInput}

          <footer className="flex items-center justify-between mt-2">
            <Link
              href="/${modelNameSnakeCasePlural}"
              className="underline text-gray-500"
            >
              Return to ${modelNameSpacedPlural} list
            </Link>
  
            <Button
              type="submit"
            >
              Create
            </Button>
          </footer>
        </form>
      </>
    )
  }
  `
}
