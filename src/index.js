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
        return res.action()
      })
      .then((res) => {
        if (res && res.data && res.data.values) {
          res.data.values.map(console.log)
        }
      })
      .catch(console.error)
    break
}
