import axios from 'axios'
import chalk from 'chalk'

import { getBitbucketToken } from './config'
import { getRemoteRepositoryName, getRemoteUsername } from './git-cli'

const GIT_REPO_NAME = getRemoteRepositoryName()
const GIT_REPO_ORIGIN_USERNAME = getRemoteUsername()
const BITBUCKET_API_BASEURL = `https://bitbucket.org/!api/2.0/repositories/${GIT_REPO_ORIGIN_USERNAME}/${GIT_REPO_NAME}`

function handleResponse(response) {
  // console.log('data - ', response.data)
  return response.data
}

function handleError(error) {
  const {
    response: { statusText, data },
  } = error

  // console.log('error - ', JSON.stringify(data.error))
  // console.log('error - ', error)
  //
  if (statusText) {
    console.log('Error status: ', chalk.yellow(statusText))
  }

  return data.error
}

export function bitbucketRequest(url, params = {}, method) {
  const BITBUCKET_TOKEN = getBitbucketToken()
  return axios({
    url,
    method: method || 'get',
    data: params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${BITBUCKET_TOKEN}`,
    },
  })
    .then(handleResponse)
    .catch((e) => Promise.reject(handleError(e)))
}

function buildAPIUrl(path) {
  return `${BITBUCKET_API_BASEURL}/${path}`
}

// TODO: recurse to get all pages of pull requests
export function getPullRequests() {
  return bitbucketRequest(buildAPIUrl('pullrequests')).then(
    (data) => data.values
  )
}

export function createPullRequest(data) {
  return bitbucketRequest(buildAPIUrl('pullrequests'), data, 'POST')
}

export function getRepository() {
  return bitbucketRequest(BITBUCKET_API_BASEURL)
}

export function getRepositoryStatuses(pullrequestId) {
  return bitbucketRequest(
    buildAPIUrl(`pullrequests/${pullrequestId}/statuses`)
  ).then((data) => data.values)
}

// TODO: recurse to get all pages of pull requests
export function getRepositoryDefaultReviewers() {
  return bitbucketRequest(buildAPIUrl('default-reviewers'))
    .then((data) => (data && data.values ? data.values : []))
    .catch((e) => {
      console.log(chalk.yellow("You don't have access to default reviewers."))
      return []
    })
}

// 1.0 API no longer available. No support for 2.0
const BITBUCKET_API_BASEURL_VERSION1 = `https://bitbucket.org/!api/1.0/repositories/${GIT_REPO_ORIGIN_USERNAME}/${GIT_REPO_NAME}`
export function addPullRequestComment(prId, comment) {
  return bitbucketRequest(
    `${BITBUCKET_API_BASEURL_VERSION1}/pullrequests/${prId}/comments`,
    comment,
    'post'
  )
}
