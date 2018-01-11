import yargs from 'yargs'
import { partialRight, omitBy, mapKeys, compact } from 'lodash'
import { camelCase } from 'change-case'
import QS from 'qs'

const stringifyQS = partialRight(QS.stringify, { encode: false })

const {
  argv,
} = yargs

export const {
  _,
  verbose: VERBOSE2,
  v: VERBOSE1,
  create,
  smart,
  status,
  ...args
} = argv

export const VERBOSE = VERBOSE1 || VERBOSE2

export const query = mapKeys(
  omitBy(args, (val, key) => key.indexOf('$') === 0),
  (val, key) => camelCase(key),
)

const [cliCommand = 'help', actionType] = _

export const command = cliCommand

export const action = compact([
  actionType,
  stringifyQS(query),
]).join('?')

export const HOME = require('os').homedir()
