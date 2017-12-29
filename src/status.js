import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import { getConfig } from './config'
import {
  bitbucketRequest,
  getPullRequests,
  getRepository,
  getRepositoryDefaultReviewers,
  getRepositoryStatuses,
} from './bitbucket'
import {
  logPRHeader,
  logPRStatus,
} from './log'

async function runStatus() {
  try {
    const pullrequests = await getPullRequests()
    if (pullrequests.length === 0) {
      console.log(chalk.yellow('No pull requests available'))
      return true
    }

    console.log(`\n${pullrequests.length} Pull request(s)`)

    const prGroups = await Promise.all(pullrequests.map(async (pullrequest) => {
      const prstatus = (await bitbucketRequest(pullrequest.links.statuses.href)).values

      return {
        id: pullrequest.id,
        pullrequest,
        statuses: prstatus
      }
    }))

    prGroups.sort(pr => pr.id).forEach(({ pullrequest, statuses }, index) => {
      const { id, title, description, author, links } = pullrequest || {}
      index === 0 ? console.log(chalk.dim('====================================')) :
        console.log('-------------------------------------')

      logPRHeader(pullrequest)

      if (statuses && statuses.length) {
        statuses.forEach(logPRStatus)
      }
    })

    return true

  } catch(e) {
    throw e
  }
}

export default function promptStatusCommand() {
  return runStatus()
}
