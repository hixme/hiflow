import inquirer from 'inquirer'
import chalk from 'chalk'

import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  getRepositoryBranch,
  refreshRepo,
  checkoutBranch,
  createBranch,
} from './git'

async function promptCheckout() {

  try {
    const { type, issue } = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'What type of branch?',
      choices: [
        'feature',
        'improvement',
        'fix',
        'hotfix',
      ],
      validate: val => !!val,
      when: () => true,
    }, {
      type: 'input',
      name: 'issue',
      message: 'Issue name:',
      validate: val => !!val,
      when: () => true,
    }])

    createBranch(`${type}/${issue}`)

    return { success: true }
  } catch (e) {
    throw e
  }
}
export default function promptCheckoutCommand() {
  return promptCheckout()
}

