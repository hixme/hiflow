#!/usr/bin/env node
import chalk from 'chalk'

import pkg from '../package'
import { command, create, status } from './args'

switch (command) {
  case 'config':
    const { runSetup } = require('./config')
    runSetup()
    break
  case 'commit':
    const { promptCommitCommand } = require('./commit')
    promptCommitCommand()
    break
  case 'checkout':
    const { promptCheckoutCommand } = require('./checkout')
    promptCheckoutCommand()
    break
  case 'pr':
    const { promptPullRequestCommand } = require('./pr')
    promptPullRequestCommand({ status, create })
      .catch((e) => {
        console.log('e = ', e)
        if (e) {
          console.log(chalk.magenta('Sorry, there was an error'))
        }
      })
    break
  case 'version':
    console.log(pkg.version)
    break
  default:
    break
}
