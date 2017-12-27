import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import {
  bitbucketRequest,
  getPullRequests,
  getRepository,
  createPullRequest,
} from './bitbucket'

import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  getRepositoryBranch,
  refreshRepo,
  checkoutBranch,
} from './git'


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
    .then((data) => {
      if (data) {
        return inquirer.prompt([
          {
            type: 'input',
            name: 'destination',
            message: 'What branch should this pull request merge into?',
            default: data.mainbranch.name,
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
            filter: val => val.trim(),
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
            reviewers.split(',').map(i => ({ username: i.trim() })) : [],
        }))
        .then(res => {
          console.log(chalk.cyan('Pull request created!'))
        })
        .catch(error => {
          console.log(error)
          throw error
        })
      }
    })
}

async function promptPullRequestList() {
  try {
    const list = await getPullRequests()

    if (list.length === 0) {
      return console.log('No pull requests found')
    }

    return inquirer.prompt([
      {
        type: 'list',
        name: 'pullrequest',
        message: 'Select a pull request?',
        choices: list.map(({ author, state, id, title, ...pr }) => ({
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
    .then((res) => {
      if (res && res.action) {
        return res.action() || true
      }

      return null
    })
    .then((data) => {
      if (data && data.values) {
        res.data.values.map(console.log)
      }
    })
  } catch (e) {
    throw e
  }
}


export function promptPullRequestCommand(create) {
  if (create) {
    return promptCreatePullRequest()
  }

  return promptPullRequestList()
}
