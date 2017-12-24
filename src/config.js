import fs from 'fs'
import inquirer from 'inquirer';
import { HOME } from './args'

const CONFIG_FILE_PATH = `${HOME}/.hiflow`

function getConfigFile() {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    return fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
  }

  throw new Error('Config not found')
}

function parseConfig(settings = '') {
  return settings.split('\n').reduce((memo, curr) => {
      const [key, value] = curr
        .split('=')
        .map(i => i.trim())
        .filter(i => i.length)

      if (key, value) {
        memo[key] = value
      }
      return memo
    }, {})
}

export function getConfig() {
  return parseConfig(getConfigFile())
}

export function promptUserSetup() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'What\'s your bitbucket username?',
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    },
    {
      type: 'password',
      name: 'password',
      message: 'What\'s your bitbucket password?',
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    },
  ])
}

