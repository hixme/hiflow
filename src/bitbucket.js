import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import { getBitbucketToken } from './config'
import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  getRepositoryBranch,
} from './git'

const BITBUCKET_TOKEN = getBitbucketToken()
const GIT_REPO_NAME = getRepositoryName()
const GIT_REPO_ORIGIN_USERNAME = getRepositoryRemoteUsername()
const BITBUCKET_API_BASEURL = `https://bitbucket.org/!api/2.0/repositories/${GIT_REPO_ORIGIN_USERNAME}/${GIT_REPO_NAME}`

function handleResponse(response) {
  // console.log('data - ', response.data)
  return response.data
}

function handleError(error) {
  // console.log('error - ', JSON.stringify(error.response.data.error))
  // console.log('error - ', error)
  return error.response.data.error
}

export default function bitbucketRequest(url, params = {}, method) {
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
  .catch(e => Promise.reject(handleError(e)))
}

function buildAPIUrl(path) {
  return `${BITBUCKET_API_BASEURL}/${path}`
}

export function getPullRequests() {
  return bitbucketRequest(buildAPIUrl(`pullrequests`))
}

export function createPullRequest(data) {
  return bitbucketRequest(buildAPIUrl('pullrequests'), data, 'POST')
}

export function getRepository() {
  return bitbucketRequest(BITBUCKET_API_BASEURL)
}

function getPullRequestActions(pr) {
  return {
    checkout: () => refreshRepo && checkoutBranch(pr.source.branch.name),
    approve: async () => await bitbucketRequest(pr.links.approve.href, {}, 'post'),
    decline: async () => await bitbucketRequest(pr.links.decline.href, {}, 'post'),
    // activity: async () => await bitbucketRequest(pr.links.activity.href),
    merge: async () => await bitbucketRequest(pr.links.merge.href, {}, 'post'),
  }
}

function promptCreatePullRequest() {
  const currentBranch = getRepositoryBranch()

  const prObj = {
    source: { branch: { name: currentBranch, }, },
    title: '',
    description: '',
    reviewers: [],
  }

  return inquirer.prompt({
      type: 'confirm',
      name: 'createpr',
      message: `Would you like to create a pull request for your branch ${currentBranch}?`,
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    })
    .then(({ createpr }) => {
      if (createpr) {
        return getRepository()
      }
    })
    .then((res) => {
      if (res) {
        return inquirer.prompt([
          {
            type: 'input',
            name: 'destination',
            message: 'What branch should this pull request merge into?',
            default: res.data.mainbranch.name,
            validate: val => !!val,
            filter: val => val.trim(),
            when: () => true,
          },
          {
            type: 'input',
            name: 'title',
            message: 'Add pull request title?',
            default: currentBranch,
            validate: val => !!val,
            filter: val => val.trim(),
            when: () => true,
          },
          {
            type: 'input',
            name: 'description',
            message: 'Add pull request description?',
            validate: val => !!val,
            filter: val => val.trim(),
            when: () => true,
          },
          {
            type: 'input',
            name: 'reviewers',
            message: 'Add reviewers? (Enter usernames as csv)',
          }
        ])
        .then(({
          destination,
          title,
          description,
          reviewers,
        }) => createPullRequest({
          ...prObj,
          destination: { branch: { name: destination } },
          title,
          description,
          reviewers: reviewers ?
            reviewers.split(',').map(i => { username: i.trim() }) : [],
        }))
        .then(res => {
          return { action: () => console.log(chalk.green('Pull request created!')) }
        })
      }
    })
}

export async function promptPullRequestList(create) {
  try {
    if (create) {
      return promptCreatePullRequest()
    }

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
            actions: getPullRequestActions({ author, state, id, title, ...pr }),
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

