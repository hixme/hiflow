import inquirer from 'inquirer'
import chalk from 'chalk'

import {
  getRepositoryBranch,
  createBranch,
} from './git'

async function promptCheckout() {
  const currentBranch = getRepositoryBranch()
  console.log(chalk.cyan(`You are on the ${currentBranch} branch.`))

  try {
    let branchType = null

    if (currentBranch === 'master') {
      const { doHotfix } = await inquirer.prompt({
        type: 'confirm',
        name: 'doHotfix',
        message: 'Do you want to do a hotfix?',
      })
      console.log(doHotfix)
      if (doHotfix) branchType = 'hotfix'
    }

    if (!branchType) {
      const { type } = await inquirer.prompt({
        type: 'list',
        name: 'type',
        message: 'What type of branch?',
        choices: [
          'feature',
          'improvement',
          'fix',
          'hotfix',
          'release',
        ],
        default: 'feature',
        validate: val => !!val,
        when: () => true,
      })

      branchType = type
    }

    const { issue } = await inquirer.prompt({
      type: 'input',
      name: 'issue',
      message: branchType === 'release' ? 'Version:' : 'Issue name:',
      validate: val => !!val,
      when: () => true,
    })

    console.log(chalk.green('Yes! I\'m excited about this.'))
    createBranch(`${branchType}/${issue}`)

    return { success: true }
  } catch (e) {
    throw e
  }
}
export function promptCheckoutCommand() {
  return promptCheckout()
}

