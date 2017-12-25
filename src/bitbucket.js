import axios from 'axios'
import inquirer from 'inquirer'
import { HOME } from './args'
import { getBitbucketToken } from './config'
import { getRepositoryName, getRepositoryRemoteUsername } from './git-info'

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

export async function promptPullRequestList() {
  try {
  const response = await getPullRequests()
    if (response.data.values.length === 0) {
      return console.log('No pull requests found')
    }

    return inquirer.prompt({
      type: 'list',
      name: 'pull-request-list',
      choices: response.data.values.map(({ state, id, title }) => `(${state}) #${id} ${title}`),
      message: 'Select a pull request?',
      validate: val => !!val,
      when: () => true,
    })
  } catch (e) {
    console.error(e)
  }
}

