import { fromGlobalId, toGlobalId } from 'graphql-relay'

import type { ContentState, EntityMapValue } from '../../mongo/ContentState'

export const parseContentStateWithGlobalId = (
  content: ContentState
): ContentState => {
  return {
    ...content,
    entityMap: {
      ...Object.fromEntries(
        Object.entries(content.entityMap).map(([key, value]) => {
          if (value.type === 'TAG') {
            const data = value.data
            return [
              key,
              {
                ...value,
                data: {
                  ...data,
                  id: fromGlobalId(data.id).id,
                },
              },
            ]
          }
          if (value.type === 'TEXT_INPUT') {
            const data = value.data
            return [
              key,
              {
                ...value,
                data: {
                  ...data,
                  fieldId: fromGlobalId(data.fieldId).id,
                },
              },
            ]
          }
          if (value.type === 'TEXT_TO_SPEECH') {
            const data = value.data
            return [
              key,
              {
                ...value,
                data: {
                  ...data,
                  fieldId: fromGlobalId(data.fieldId).id,
                },
              },
            ]
          }

          return [key, value]
        })
      ),
    },
  }
}

export const encodeEntityMapWithGlobalId = (
  entityMap: ContentState['entityMap']
): ContentState['entityMap'] => {
  return {
    ...Object.fromEntries(
      Object.entries(entityMap).map(([key, value]) => {
        if (value.type === 'TAG') {
          const data = value.data
          return [
            key,
            {
              ...value,
              data: {
                ...data,
                id: toGlobalId('Field', data.id),
              },
            },
          ]
        }
        if (value.type === 'TEXT_INPUT') {
          const data = value.data
          return [
            key,
            {
              ...value,
              data: {
                ...data,
                fieldId: toGlobalId('Field', data.fieldId),
              },
            },
          ]
        }
        if (value.type === 'TEXT_TO_SPEECH') {
          const data = value.data
          return [
            key,
            {
              ...value,
              data: {
                ...data,
                fieldId: toGlobalId('Field', data.fieldId),
              },
            },
          ]
        }

        return [key, value]
      })
    ),
  }
}

const SUPPORTED_TYPES: EntityMapValue['type'][] = [
  'TAG',
  'TEXT_TO_SPEECH',
  'TEXT_INPUT',
  'LINK',
]

export const validateContentStateInput = (
  contentStateInput: ContentStateInput
): contentStateInput is ContentState => {
  const entityMap = contentStateInput.entityMap

  for (const [, value] of Object.entries(entityMap ?? {})) {
    if (typeof value !== 'object' || value == null) {
      return false
    }

    if (!('type' in value) || !('mutability' in value) || !('data' in value)) {
      return false
    }

    const type = (value as any).type

    if (
      typeof type !== 'string' ||
      !(SUPPORTED_TYPES as string[]).includes(type)
    ) {
      return false
    }

    const mutability = (value as any).mutability

    if (
      typeof mutability !== 'string' ||
      (mutability !== 'MUTABLE' &&
        mutability !== 'IMMUTABLE' &&
        mutability !== 'SEGMENTED')
    ) {
      return false
    }

    const data = (value as any).data

    if (typeof data !== 'object') {
      return false
    }

    switch (type) {
      case 'TAG': {
        const id = (data as any).id

        if (typeof id !== 'string') {
          return false
        }
        break
      }
      case 'TEXT_INPUT': {
        const id = (data as any).fieldId

        if (typeof id !== 'string') {
          return false
        }
        break
      }
      case 'TEXT_TO_SPEECH': {
        const id = (data as any).fieldId

        if (typeof id !== 'string') {
          return false
        }
        break
      }
      case 'LINK': {
        const url = (data as any).url

        if (typeof url !== 'string') {
          return false
        }
        break
      }
    }
  }

  return true
}
