import inquirer from 'inquirer'
import chalk from 'chalk'
import {
  allowSmartCommits,
} from './config'
import {
  getRepositoryBranch,
  createCommit,
} from './git'

export function getIssueFromBranch(branch) {
  const [type, issue] = branch.split('/')
  return issue
}

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

export async function promptCommit({ message, smart } = {}) {
  const currentBranch = getRepositoryBranch()
  const initialMessage = typeof smart === 'string' ? smart : message
  let smartMessage

  try {
    const { addmessage } = await inquirer.prompt({
      type: 'input',
      name: 'addmessage',
      message: `${currentBranch}:`,
      validate: val => !!val,
      when: () => !initialMessage,
    })

    const commitMessage = initialMessage || addmessage

    if (smart) {
      const issueName = getIssueFromBranch(currentBranch)

      const { issue } = await inquirer.prompt({
        type: 'input',
        name: 'issue',
        message: 'Issue:',
        default: issueName,
        validate: val => !!val,
        when: () => true,
      })

      const { time } = await inquirer.prompt({
        type: 'input',
        name: 'time',
        message: 'How much time have you spent? w/d/h/m/(s)kip',
        default: 'skip',
        validate: val => !!val,
        when: () => true,
      })

      if (time.includes('w') || time.includes('d') || time.includes('h') || time.includes('m')) {
        smartMessage = `${issue} #time ${time}`
      } else {
        console.log(chalk.magenta('No time was tracked'))
      }
    }

    const completeMessage = `${commitMessage}${(smartMessage ? `\n\n${smartMessage}` : '')}`
    execCommit(completeMessage)

    const randomNum = Math.ceil(Math.random() * 10)
    if ([3, 7].includes(randomNum)) {
      console.log(chalk.yellow('Nailed it!'))
    }
    if ([2, 5].includes(randomNum)) {
      console.log(chalk.cyan('Mmmm, the people are gonna like that!'))
    }

    return { success: true }
  } catch (e) {
    throw e
  }
}

export async function runCommit(args) {
  try {
    return await promptCommit(args)
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
