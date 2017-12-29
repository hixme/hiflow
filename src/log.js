import chalk from 'chalk'

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
    console.log(`Build: ${buildColor(state)}`)
    console.log(`URL: ${url}\n`)
  }
}

export function logPRHeader({ id, author, title, description }) {
  console.log(`
${chalk.cyan(`#${id} ${title}`)}
Author: ${author.display_name}
`)
}

export function logPRDescription({ description }) {
  console.log(`${chalk.yellow('Description:')} ${description} `)
}
