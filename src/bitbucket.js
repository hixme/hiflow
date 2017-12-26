import axios from 'axios'
import inquirer from 'inquirer'
import { HOME } from './args'
import { getBitbucketToken } from './config'
import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  refreshRepo,
  checkoutBranch,
} from './git-info'

const BITBUCKET_TOKEN = getBitbucketToken()
const GIT_REPO_NAME = getRepositoryName()
const GIT_REPO_ORIGIN_USERNAME = getRepositoryRemoteUsername()

function bitbucketRequest(url, params = {}, method) {
  return axios({
    url,
    method: method || 'get',
    data: params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${BITBUCKET_TOKEN}`,
    },
  })
}
export function getPullRequests() {
  return bitbucketRequest(`https://bitbucket.org/!api/2.0/repositories/${GIT_REPO_ORIGIN_USERNAME}/${GIT_REPO_NAME}/pullrequests`)
}

function getPullRequestActions(pr) {
  return {
    checkout: () => checkoutBranch(pr.source.branch.name),
    approve: async () => await bitbucketRequest(pr.links.approve.href, {}, 'post'),
    decline: async () => await bitbucketRequest(pr.links.decline.href, {}, 'post'),
    // activity: async () => await bitbucketRequest(pr.links.activity.href),
    // merge: async () => await bitbucketRequest(pr.links.merge.href),
  }
}
export async function promptPullRequestList() {
  try {
  const response = await getPullRequests()
    if (response.data.values.length === 0) {
      return console.log('No pull requests found')
    }

    return inquirer.prompt([
      {
        type: 'list',
        name: 'pullrequest',
        message: 'Select a pull request?',
        choices: response.data.values.map(({ author, state, id, title, ...pr }) => ({
          name: `(${state}) #${id} by ${author.display_name} - ${title}`,
          value: {
            actions: getPullRequestActions(pr),
            author,
            id,
            title,
            ...pr
          },
        })),
        validate: val => !!val,
        when: () => true,
      }, {
        type: 'list',
        name: 'action',
        message: 'What action would you like to perform?',
        choices: (answers) => Object.keys(answers.pullrequest.actions).map(action => ({
          name: action,
          value: answers.pullrequest.actions[action]
        })),
        validate: val => !!val,
        when: () => true,
      }
    ])
  } catch (e) {
    throw e
  }
}

