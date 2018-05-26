#!/usr/bin/env node
import chalk from 'chalk'

import { command, create, status, action, smart } from './args'


/* eslint-disable  global-require */
switch (command) {
  case 'config': {
    const { runSetup } = require('./config')
    runSetup()
    break
  }
  case 'commit': {
    const { runCommit } = require('./commit')
    runCommit({ message: action, smart })
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
        console.log(chalk.magenta('Sorry, there was an error'))
        if (e) {
          console.log(e)
        }
      })
    break
  }
  case 'version': {
    const pkg = require('../package.json')
    console.log(pkg.version)
    break
  }
  case 'jira': {
    const jira = require('./jira')
    jira()
      .catch((e) => {
        console.log(chalk.magenta('Sorry, there was an error'))
        if (e) {
          console.log(e)
        }
      })
    break
  }
  default:
    break
}
