import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import { layout } from '../template/layout'
import { dashboard } from '../template/dashboard'
import { list } from '../template/list'
import { show } from '../template/show'
import { create } from '../template/create'
import { edit } from '../template/edit'
import { lib } from '../template/lib'
import { textInput } from '../template/components/text-input'
import { writeFileSafely } from '../utils/writeFileSafely'

export async function genPagesForModels(models: DMMF.Model[], output: string) {
  const dashboardFile = dashboard(models.map((model) => model.name))
  const appPath = path.join(output, 'app')
  const componentsPath = path.join(output, 'components')

  await Promise.all([
    writeFileSafely(path.join(appPath, 'page.tsx'), dashboardFile),
    writeFileSafely(path.join(output, 'lib', 'prisma.ts'), lib),
    writeFileSafely(path.join(appPath, 'layout.tsx'), layout),
    writeFileSafely(path.join(componentsPath, 'TextInput.tsx'), textInput),
  ])

  for (const model of models) {
    const modelNameLower = model.name.toLowerCase()

    const indexFile = list(model)
    const showFile = show(model.name, model.fields)
    const createFile = create(model.name, model.fields)
    const editFile = edit(model.name, model.fields)

    await Promise.all([
      writeFileSafely(
        path.join(appPath, `${modelNameLower}s`, 'page.tsx'),
        indexFile,
      ),
      writeFileSafely(
        path.join(appPath, `${modelNameLower}s`, 'create', 'page.tsx'),
        createFile,
      ),
      writeFileSafely(
        path.join(appPath, `${modelNameLower}s`, '[id]', 'page.tsx'),
        showFile,
      ),
      writeFileSafely(
        path.join(appPath, `${modelNameLower}s`, '[id]', 'edit', 'page.tsx'),
        editFile,
      ),
    ])
  }
}
