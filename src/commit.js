import inquirer from 'inquirer'
import chalk from 'chalk'
import {
  allowSmartCommits,
} from './config'
import {
  getRepositoryBranch,
  createCommit,
} from './git'

export function formatMessage({ message, branch }) {
  return `${branch}: ${message}`
}

export function execCommit(message) {
  const branch = getRepositoryBranch()
  const commitMessage = formatMessage({ message, branch })
  const result = createCommit(commitMessage)
  console.log(result)
  return result
}

export async function promptCommit(useMessage) {
  const currentBranch = getRepositoryBranch()

  try {
    const { message } = await inquirer.prompt({
      type: 'input',
      name: 'message',
      message: `${currentBranch}:`,
      validate: val => !!val,
      when: () => !useMessage,
    })

    await inquirer.prompt({
      type: 'input',
      name: 'time',
      message: 'How much time have you spent? w/d/h/m',
      when: allowSmartCommits,
    })

    const randomNum = Math.ceil(Math.random() * 10)
    if ([3, 7].includes(randomNum)) {
      console.log(chalk.yellow('Nailed it!'))
    }

    execCommit(message)

    return { success: true }
  } catch (e) {
    throw e
  }
}

export async function runCommit(message) {
  try {
    return await promptCommit(message)
  } catch (e) {
    if (e && e.message) {
      console.log(chalk.magenta(e.message))
      if (e.message.startsWith('Command failed')) {
        console.log(chalk.yellow('Did you add your changes?'))
      }
    } else {
      console.log(chalk.yellow('There was an unknown error.'))
    }
    return ''
  }
}
