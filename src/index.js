#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk'

import { _, command, create, args } from './args';
import { runSetup } from './config'
import { promptPullRequestCommand } from './pr'

switch (command) {
  case 'config':
    runSetup()
    break
  case 'pr':
    promptPullRequestCommand(create)
      .catch(e => {
        console.log('e = ', e)
        if (e) {
          console.log(chalk.magenta('Sorry, there was an error'))
        }
      })
    break
}
