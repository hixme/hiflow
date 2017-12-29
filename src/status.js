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
    await Promise.all(pullrequests.map(async pullrequest => {

      const { id, title, description, author, links } = pullrequest || {}
      const statuses = (await bitbucketRequest(links.statuses.href)).values

      logPRHeader(pullrequest)

      if (statuses && statuses.length) {
        statuses.forEach(logPRStatus)
      }
      console.log('-------------------------------------')
    }))
    return true

  } catch(e) {
    throw e
  }
}

export default function promptStatusCommand() {
  return runStatus()
}
