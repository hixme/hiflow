#!/usr/bin/env node
import inquirer from 'inquirer';

import { _, command, create, args } from './args';
import { runSetup } from './config'
import { promptPullRequestList } from './bitbucket'

switch (command) {
  case 'config':
    runSetup()
    break
  case 'pr':
    promptPullRequestList(create)
      .then((res) => {
        if (res && res.action) {
          return res.action()
        }

        return null
      })
      .then((res) => {
        if (res && res.data && res.data.values) {
          res.data.values.map(console.log)
        }
      })
      .catch(console.error)
    break
}
