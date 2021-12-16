import { genKey } from 'draft-js'

import type { ContentState, EntityMapValue } from '../mongo/ContentState'
import type { FieldDocument } from '../mongo/Field'

type DraftRichObject = {
  type: string
  text: string
  data: Record<string, unknown>
}

export const draftContent = (
  strings: TemplateStringsArray,
  ...keys: (number | string | DraftRichObject)[]
) => {
  return (modelFields: FieldDocument[] = []): ContentState => {
    const entityMap: Record<string, EntityMapValue> = {}
    const entityList: Array<{
      entityKey: number
      entityOffset: number
      entityLength: number
    }> = []

    let entitiesCreated = 0

    const blocks = strings
      .reduce((total, str, index) => {
        if (index === strings.length - 1) {
          return total + str
        }

        const rawKeyEntity = keys[index]

        if (typeof rawKeyEntity !== 'object') {
          return total + str + rawKeyEntity
        }

        const draftEntity = getDraftEntityDataByType(rawKeyEntity, modelFields)

        const entityKey = entitiesCreated++

        entityMap[entityKey] = draftEntity

        const entityOffset = total.length + str.length
        const entityLength = rawKeyEntity.text.length

        entityList.push({ entityKey, entityOffset, entityLength })

        return total + str + rawKeyEntity.text
      }, '')
      .split('\n')
      .map((line, index, rawBlocks) => {
        // offset of `line` relative to all
        // blocks. used to calculate the entity
        // ranges inside this line and correctly
        // apply them in the `entityRanges` below
        const currentBlockOffset =
          rawBlocks
            .slice(0, index + 1)
            .reduce(
              (total, rawBlockString) => total + rawBlockString.length,
              0
            ) + index

        const lineLength = line.length

        return {
          key: genKey(),
          text: line,
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          data: {},
          entityRanges: entityList
            .filter(
              (e) =>
                e.entityOffset >= currentBlockOffset &&
                e.entityOffset < currentBlockOffset + lineLength
            )
            .map(({ entityOffset, entityLength, entityKey }) => ({
              offset: entityOffset,
              length: entityLength,
              key: entityKey,
            })),
        }
      })

    return {
      blocks,
      entityMap,
    }
  }
}

export const mention = (fieldName: string): DraftRichObject => {
  return {
    type: 'TAG',
    text: fieldName,
    data: {
      fieldName,
    },
  }
}

const getDraftEntityDataByType = (
  rawKeyEntity: DraftRichObject,
  modelFields: FieldDocument[]
): EntityMapValue => {
  let data
  if (rawKeyEntity.type === 'TAG') {
    data = {
      ...rawKeyEntity.data,
      id: modelFields.find(
        (field) => field.name === rawKeyEntity.data.fieldName
      )!._id as string,
    }
  } else if (
    rawKeyEntity.type === 'TEXT_INPUT' ||
    rawKeyEntity.type === 'TEXT_TO_SPEECH'
  ) {
    data = {
      ...rawKeyEntity.data,
      fieldId: modelFields.find(
        (field) => field.name === rawKeyEntity.data.fieldName
      )!._id as string,
    }
  } else {
    data = rawKeyEntity.data as EntityMapValue['data']
  }

  return {
    type: rawKeyEntity.type as EntityMapValue['type'],
    mutability: 'IMMUTABLE',
    data,
  } as EntityMapValue
}
