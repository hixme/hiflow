#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk'

import { _, command, create, status, args } from './args';
import { runSetup } from './config'
import promptPullRequestCommand from './pr'
import promptCheckoutCommand from './checkout'
import promptCommitCommand from './commit'

switch (command) {
  case 'config':
    runSetup()
    break
  case 'commit':
    promptCommitCommand()
    break
  case 'checkout':
    promptCheckoutCommand()
    break
  case 'pr':
    promptPullRequestCommand({ status, create })
      .catch(e => {
        console.log('e = ', e)
        if (e) {
          console.log(chalk.magenta('Sorry, there was an error'))
        }
      })
    break
}
