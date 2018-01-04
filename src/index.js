#!/usr/bin/env node
import chalk from 'chalk'

import { command, create, status, action } from './args'

/* eslint-disable  global-require */
switch (command) {
  case 'config': {
    const { runSetup } = require('./config')
    runSetup()
    break
  }
  case 'commit': {
    if (action) {
      const { runExecCommit } = require('./commit')
      runExecCommit(action)
    } else {
      const { promptCommitCommand } = require('./commit')
      promptCommitCommand()
    }
    break
  }
  case 'checkout': {
    const { promptCheckoutCommand } = require('./checkout')
    promptCheckoutCommand()
    break
  }
  case 'pr': {
    const { promptPullRequestCommand } = require('./pr')
    promptPullRequestCommand({ status, create })
      .catch((e) => {
        console.log('e = ', e)
        if (e) {
          console.log(chalk.magenta('Sorry, there was an error'))
        }
      })
    break
  }
  case 'version': {
    const pkg = require('../package.json')
    console.log(pkg.version)
    break
  }
  default:
    break
}
