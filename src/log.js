import chalk from 'chalk'

export function logPRLink(link) {
  console.log(`${chalk.cyan('==>')} ${link}`)
}

export function logPRStatus({ state, type, url }) {
  if (type === 'build') {
    let buildColor = chalk.white
    if (state === 'INPROGRESS') {
      buildColor = chalk.yellow
    } else if (state === 'SUCCESSFUL') {
      buildColor = chalk.green
    } else if (state === 'FAILED') {
      buildColor = chalk.red
    }
    console.log(`Build: ${buildColor(state)} ${url}\n`)
  }
}

export function logPRHeader({ id, author, title, description }) {
  console.log(`
${chalk.cyan(`#${id} ${title}`)}
Author: ${author.display_name}
`)
}

export function logPRDescription(description) {
  console.log(`${chalk.yellow('Description:')}
${description}
`)
}

export function logPRApprovals(approvals = []) {
  if (approvals.length) {
    console.log(`${chalk.green('\u2713')} Approved by ${approvals.join(', ')}\n`)
  } else {
    console.log(`${chalk.red('\u2717')} Not yet approved \n`)
  }
}
