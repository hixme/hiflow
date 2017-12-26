#!/usr/bin/env node
import inquirer from 'inquirer';

import { _, command, args } from './args';
import { runSetup } from './config'
import { promptPullRequestList } from './bitbucket'

switch (command) {
  case 'config':
    runSetup()
    break
  case 'prs':
    promptPullRequestList()
      .then((res) => {
        res.action()
      })
    break
}
