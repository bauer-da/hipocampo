// @ts-ignore typings are outdated
import JSON, { GraphQLJSONObject as JSONObject } from 'graphql-type-json'

import {
  queries as deckQueries,
  root as deckRoot,
  mutations as deckMutations,
} from './deck'
import { queries as noteQueries, root as noteRoot } from './note'
import {
  queries as userQueries,
  root as userRoot,
  mutations as userMutations,
} from './user'
import {
  queries as templateQueries,
  root as templateRoot,
  mutations as templateMutations,
} from './template'
import { root as fieldRoot } from './field'
import { root as fieldValueRoot } from './fieldValue'
import { root as cardRoot } from './card'
import {
  queries as cardModelQueries,
  root as cardModelRoot,
  mutations as cardModelMutations,
} from './cardModel'
import { root as contentStateRoot } from './contentState'

export default {
  JSON,
  JSONObject,
  ...deckRoot,
  ...noteRoot,
  ...templateRoot,
  ...fieldRoot,
  ...fieldValueRoot,
  ...cardRoot,
  ...cardModelRoot,
  ...userRoot,
  ...contentStateRoot,
  Query: {
    ...deckQueries,
    ...noteQueries,
    ...templateQueries,
    ...cardModelQueries,
    ...userQueries,
  },
  Mutation: {
    ...deckMutations,
    ...cardModelMutations,
    ...templateMutations,
    ...userMutations,
  },
}
