#!/usr/bin/env node
import inquirer from 'inquirer';

import { _, command, args } from './args';
import { runSetup } from './config'
import { promptPullRequestList } from './bitbucket'

function promptPrAction(res) {
  console.log('res = ', res)
  return inquirer.prompt({
    type: 'list',
    name: 'pr-action',
    choices: [
      'checkout',
      'approve',
    ],
    message: 'Select a pull request?',
    validate: val => !!val,
    when: () => true,
  })
}

switch (command) {
  case 'config':
    runSetup()
    break
  case 'prs':
    promptPullRequestList()
      .then(promptPrAction)
    break
  default:
    console.log('hello', command)
}
