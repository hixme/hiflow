import inquirer from 'inquirer'
import chalk from 'chalk'

import {
  getRepositoryBranch,
  createCommit,
} from './git'

export async function execCommit(message, branch) {
  const currentBranch = branch || getRepositoryBranch()

  try {
    const fullMessage = `${currentBranch}: ${message}`
    createCommit(fullMessage)
    return { success: true }
  } catch (e) {
    throw e
  }
}

export async function promptCommit() {
  const currentBranch = getRepositoryBranch()

  try {
    const { message } = await inquirer.prompt({
      type: 'input',
      name: 'message',
      message: `${currentBranch}:`,
      validate: val => !!val,
      when: () => true,
    })

    const randomNum = Math.ceil(Math.random() * 10)
    if ([3, 7].includes(randomNum)) {
      console.log(chalk.yellow('Nailed it!'))
    }

    await execCommit(message, currentBranch)
  } catch (e) {
    throw e
  }
}

export function promptCommitCommand() {
  return promptCommit()
}

export function runExecCommit(arg) {
  return execCommit(arg)
}
